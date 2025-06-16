import { PanaStoreClient } from "@pana-commerce/pana-sdk";
import { Product, Category, Store } from "../panaTypes";
import { createResource } from "../utils/suspense";

const STORE_API_TOKEN = import.meta.env.VITE_PANA_STORE_API_TOKEN;

let storeClient: PanaStoreClient | null = null;

const getStoreClient = (): PanaStoreClient => {
  if (!storeClient) {
    storeClient = new PanaStoreClient(STORE_API_TOKEN);
  }
  return storeClient;
};

export const fetchStoreData = async (): Promise<Store> => {
  return getStoreClient().getStore() as Promise<Store>;
};

export const fetchCategory = async (categoryId: number): Promise<Category> => {
  const response = await getStoreClient().getCategory(categoryId);
  return response as Category;
};

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await getStoreClient().getAllCategories({});
  return response?.data as Category[];
};

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await getStoreClient().getAllProducts({});
  return response?.data as Product[];
};

export const fetchProductDetails = async (
  productId: number
): Promise<Product> => {
  const productData = await getStoreClient().getProduct(productId);
  return productData as Product;
};

export const storeResource = createResource(fetchStoreData());
export const productsResource = createResource(fetchProducts());
