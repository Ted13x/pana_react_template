// src/context/PanaStoreContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { PanaStoreClient } from "@pana-commerce/pana-sdk";
import { initSecurity } from "../utils/security";
import {
  fetchStoreData,
  fetchProducts,
  getProduct,
} from "./panaStoreFunctions";
import type { components } from "@pana-commerce/pana-sdk/dist/public-api";

// Store-Typen aus der SDK
export type Store = components["schemas"]["Store"];
export type Product = components["schemas"]["StoreProduct"];

export interface ProductsQueryParams {
  limit?: number;
  offset?: number;
  searchKey?: string;
  sort?: string;
  filters?: string[];
  searchFields?: string[];
}

export interface PanaStoreConfig {
  storeApiToken: string;
  shopId: string;
  apiBaseUrl?: string;
  debug?: boolean;
}

export interface PanaStoreContextType {
  // Allgemeine Konfiguration und Client
  config: PanaStoreConfig;
  storeClient: PanaStoreClient | null;

  // Store-bezogene Daten und Funktionen
  store: Store | null;
  storeLoading: boolean;
  storeError: string | null;
  refreshStore: () => Promise<void>;

  // Produkt-bezogene Daten und Funktionen
  products: Product[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  productsLoading: boolean;
  productsError: string | null;
  fetchProducts: (params?: ProductsQueryParams) => Promise<void>;
  getProduct: (productId: number) => Promise<Product | null>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
}

const defaultContextValue: PanaStoreContextType = {
  config: {
    storeApiToken: "",
    shopId: "",
    apiBaseUrl: "https://api.pana.app/v1",
    debug: false,
  },
  storeClient: null,

  store: null,
  storeLoading: true,
  storeError: null,
  refreshStore: async () => {},

  products: [],
  totalProducts: 0,
  currentPage: 1,
  totalPages: 0,
  productsLoading: true,
  productsError: null,
  fetchProducts: async () => {},
  getProduct: async () => null,
  searchTerm: "",
  setSearchTerm: () => {},
  selectedCategory: null,
  setSelectedCategory: () => {},
  sortOption: "newest",
  setSortOption: () => {},
};

export const PanaStoreContext =
  createContext<PanaStoreContextType>(defaultContextValue);

interface PanaStoreProviderProps {
  children: ReactNode;
  config: PanaStoreConfig;
  initialProductsLimit?: number;
  initialCategory?: string | null;
}

export const PanaStoreProvider: React.FC<PanaStoreProviderProps> = ({
  children,
  config,
  initialProductsLimit = 10,
  initialCategory = null,
}) => {
  console.log("PanaStoreProvider initialized with config:", {
    storeApiToken: config.storeApiToken
      ? `${config.storeApiToken.substring(0, 4)}...`
      : "not provided",
    shopId: config.shopId,
    apiBaseUrl: config.apiBaseUrl,
    debug: config.debug,
  });

  // Allgemeine States
  const [storeClient, setStoreClient] = useState<PanaStoreClient | null>(null);

  // Store-bezogene States
  const [store, setStore] = useState<Store | null>(null);
  const [storeLoading, setStoreLoading] = useState<boolean>(true);
  const [storeError, setStoreError] = useState<string | null>(null);

  // Produkt-bezogene States
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory
  );
  const [sortOption, setSortOption] = useState<string>("newest");

  // Initialisierung der Security und des Store Clients
  useEffect(() => {
    console.log("Starting client initialization with shopId:", config.shopId);

    if (config.shopId) {
      initSecurity(config.shopId);
      console.log("Security initialized with shopId:", config.shopId);
    } else {
      console.error("PANA SDK: No Shop ID found in configuration");
      setStoreError("Shop ID missing");
      setProductsError("Shop ID missing");
    }

    if (!config.storeApiToken) {
      console.error("PANA SDK: Store API Token missing in configuration");
      setStoreError("Store API Token missing");
      setProductsError("Store API Token missing");
      setStoreLoading(false);
      setProductsLoading(false);
      return;
    }

    try {
      console.log("Creating PanaStoreClient with token");
      const client = new PanaStoreClient(config.storeApiToken);
      console.log("PanaStoreClient successfully created");

      setStoreClient(client);
      setStoreLoading(false);
      setProductsLoading(false);
    } catch (err) {
      console.error("Error initializing Store Client:", err);
      setStoreError("Error initializing Store Client");
      setProductsError("Error initializing Store Client");
      setStoreLoading(false);
      setProductsLoading(false);
    }
  }, [config.shopId, config.storeApiToken]);

  // Store-Daten laden, wenn der Client verfügbar ist
  useEffect(() => {
    if (storeClient) {
      console.log("Store client available, fetching store data");
      handleFetchStoreData();
    }
  }, [storeClient]);

  // Initiale Produktdaten laden, wenn der Client verfügbar ist
  useEffect(() => {
    if (storeClient) {
      console.log("Store client available, fetching initial products");
      handleFetchProducts({
        limit: initialProductsLimit,
        offset: 0,
        filters: initialCategory ? [`category:${initialCategory}`] : undefined,
      });
    }
  }, [storeClient, initialProductsLimit, initialCategory]);

  // Wrapper-Funktionen, die die ausgelagerten Funktionen aufrufen
  const handleFetchStoreData = async () => {
    if (!storeClient) return;

    setStoreLoading(true);
    setStoreError(null);

    try {
      const storeData = await fetchStoreData(storeClient);
      setStore(storeData);
    } catch (error) {
      console.error("Error loading store data:", error);
      setStoreError(
        error instanceof Error ? error.message : "Error loading store data"
      );
    } finally {
      setStoreLoading(false);
    }
  };

  // In PanaStoreContext.tsx, Änderung an handleFetchProducts
  const handleFetchProducts = async (params: ProductsQueryParams = {}) => {
    if (!storeClient) {
      console.error("Cannot fetch products: Store client not available");
      return;
    }

    setProductsLoading(true);
    setProductsError(null);

    try {
      console.log("Fetching products with client:", storeClient);
      const result = await fetchProducts(
        storeClient,
        params,
        initialProductsLimit
      );

      console.log("Products fetch result:", {
        resultReceived: !!result,
        productsCount: result?.products?.length || 0,
        totalProducts: result?.totalProducts || 0,
      });

      setProducts(result.products);
      setTotalProducts(result.totalProducts);
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Error loading products:", error);
      setProductsError(
        error instanceof Error ? error.message : "Error loading products"
      );
      // Leeres Array setzen, damit die UI entsprechend reagieren kann
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleGetProduct = async (
    productId: number
  ): Promise<Product | null> => {
    if (!storeClient) {
      setProductsError("Store client not initialized");
      return null;
    }

    setProductsLoading(true);
    setProductsError(null);

    try {
      const productData = await getProduct(storeClient, productId);
      return productData;
    } catch (error) {
      console.error(`Error fetching product with ID ${productId}:`, error);
      setProductsError(
        error instanceof Error ? error.message : "Error fetching product"
      );
      return null;
    } finally {
      setProductsLoading(false);
    }
  };

  const refreshStore = async () => {
    console.log("Refreshing store data");
    await handleFetchStoreData();
  };

  // Context-Wert
  const contextValue: PanaStoreContextType = {
    config,
    storeClient,

    store,
    storeLoading,
    storeError,
    refreshStore,

    products,
    totalProducts,
    currentPage,
    totalPages,
    productsLoading,
    productsError,
    fetchProducts: handleFetchProducts,
    getProduct: handleGetProduct,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortOption,
    setSortOption,
  };

  return (
    <PanaStoreContext.Provider value={contextValue}>
      {children}
    </PanaStoreContext.Provider>
  );
};
