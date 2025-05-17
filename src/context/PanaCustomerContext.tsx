// src/context/PanaCustomerContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";
import {
  PanaCustomerClient,
  RegisterStoreCustomerDtoCustomerType,
} from "@pana-commerce/pana-sdk";
import { secureStorage, initSecurity } from "../utils/security";
import type { components } from "@pana-commerce/pana-sdk/dist/public-api";

// Typen aus der SDK
export type Customer = components["schemas"]["StoreCustomer"];
export type Order = components["schemas"]["StoreCustomerOrder"];
export type Address = components["schemas"]["StoreCustomerAddress"];
export type ShoppingCart = components["schemas"]["StoreCustomerShoppingCart"];
export type Wishlist = components["schemas"]["StoreCustomerWishlist"];

export interface PanaCustomerContextType {
  // Client und Auth-Status
  customerClient: PanaCustomerClient | null;
  isAuthenticated: boolean;
  authToken: string | null;

  // Customer Daten
  customer: Customer | null;
  loading: boolean;
  error: string | null;

  // Shopping Cart
  cart: ShoppingCart | null;
  cartLoading: boolean;
  cartError: string | null;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, amount: number) => Promise<boolean>;
  removeFromCart: (itemId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  checkout: () => Promise<any>;

  // Wishlist
  wishlists: Wishlist[] | null;
  wishlistsLoading: boolean;
  wishlistsError: string | null;
  refreshWishlists: () => Promise<void>;
  createWishlist: (
    name: string,
    description?: string
  ) => Promise<Wishlist | null>;
  updateWishlist: (
    wishlistId: number,
    name: string,
    description?: string
  ) => Promise<Wishlist | null>;
  deleteWishlist: (wishlistId: number) => Promise<boolean>;
  addToWishlist: (wishlistId: number, productId: number) => Promise<boolean>;
  removeFromWishlist: (
    wishlistId: number,
    productId: number
  ) => Promise<boolean>;
  clearWishlist: (wishlistId: number) => Promise<boolean>;

  // Address
  addresses: Address[] | null;
  addressesLoading: boolean;
  addressesError: string | null;
  refreshAddresses: () => Promise<void>;
  createAddress: (addressData: Partial<Address>) => Promise<Address | null>;
  updateAddress: (
    addressId: number,
    addressData: Partial<Address>
  ) => Promise<Address | null>;
  deleteAddress: (addressId: number) => Promise<boolean>;
  setDefaultAddress: (addressId: number) => Promise<boolean>;

  // Orders
  orders: Order[] | null;
  ordersLoading: boolean;
  ordersError: string | null;
  refreshOrders: () => Promise<void>;
  getOrder: (orderId: number) => Promise<Order | null>;
  // createOrder: (orderData: { comment?: string; addressId: number }) => Promise<Order | null>;

  // Authentication
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    customPropertyValues: []
  ) => Promise<boolean>;
  refreshCustomer: () => Promise<void>;
  updateCustomer?: (data: Partial<Customer>) => Promise<Customer | null>;
  changePassword: (
    oldPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  changeEmail: (newEmail: string) => Promise<boolean>;
}

const defaultContextValue: PanaCustomerContextType = {
  customerClient: null,
  isAuthenticated: false,
  authToken: null,

  customer: null,
  loading: true,
  error: null,

  cart: null,
  cartLoading: true,
  cartError: null,
  refreshCart: async () => {},
  addToCart: async () => false,
  removeFromCart: async () => false,
  clearCart: async () => false,
  checkout: async () => null,

  wishlists: null,
  wishlistsLoading: true,
  wishlistsError: null,
  refreshWishlists: async () => {},
  createWishlist: async () => null,
  updateWishlist: async () => null,
  deleteWishlist: async () => false,
  addToWishlist: async () => false,
  removeFromWishlist: async () => false,
  clearWishlist: async () => false,

  addresses: null,
  addressesLoading: true,
  addressesError: null,
  refreshAddresses: async () => {},
  createAddress: async () => null,
  updateAddress: async () => null,
  deleteAddress: async () => false,
  setDefaultAddress: async () => false,

  orders: null,
  ordersLoading: true,
  ordersError: null,
  refreshOrders: async () => {},
  getOrder: async () => null,
  // createOrder: async () => null,

  login: async () => false,
  logout: async () => {},
  register: async () => false,
  refreshCustomer: async () => {},
  updateCustomer: async () => null,
  changePassword: async () => false,
  changeEmail: async () => false,
};

export const PanaCustomerContext =
  createContext<PanaCustomerContextType>(defaultContextValue);

interface PanaCustomerProviderProps {
  children: ReactNode;
  storeApiToken: string;
  debug?: boolean;
}

export const PanaCustomerProvider: React.FC<PanaCustomerProviderProps> = ({
  children,
  storeApiToken,
  debug = false,
}) => {
  // Client und Auth States
  const [customerClient, setCustomerClient] =
    useState<PanaCustomerClient | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Customer States
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Shopping Cart States
  const [cart, setCart] = useState<ShoppingCart | null>(null);
  const [cartLoading, setCartLoading] = useState<boolean>(true);
  const [cartError, setCartError] = useState<string | null>(null);

  // Wishlist States
  const [wishlists, setWishlists] = useState<Wishlist[] | null>(null);
  const [wishlistsLoading, setWishlistsLoading] = useState<boolean>(true);
  const [wishlistsError, setWishlistsError] = useState<string | null>(null);

  // Address States
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [addressesLoading, setAddressesLoading] = useState<boolean>(true);
  const [addressesError, setAddressesError] = useState<string | null>(null);

  // Order States
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Initialisierung der Security
  useEffect(() => {
    const setupSecurity = async () => {
      try {
        // Verwende den ConfigContext für shopId
        const configElement = document.querySelector("[data-pana-shopid]");
        const shopId = configElement?.getAttribute("data-pana-shopid");

        if (shopId) {
          // Initialisiere Security mit shopId
          initSecurity(shopId);
          if (debug) {
            console.log(
              "PanaCustomerProvider: Security wurde initialisiert mit shopId:",
              shopId
            );
          }

          // Nach der Security-Initialisierung können wir den gespeicherten Token prüfen
          checkAuthStatus();
        } else {
          console.error(
            "PanaCustomerProvider: Keine Shop-ID gefunden. Security kann nicht initialisiert werden."
          );
          setLoading(false);
        }
      } catch (err) {
        console.error(
          "PanaCustomerProvider: Fehler bei der Security-Initialisierung:",
          err
        );
        setLoading(false);
      }
    };

    setupSecurity();
  }, [debug]);

  // Prüfen auf gespeicherten Auth-Token
  const checkAuthStatus = async () => {
    try {
      const storedToken = await secureStorage.getItem("pana_auth_token");
      if (storedToken) {
        setAuthToken(storedToken);
        const client = new PanaCustomerClient(storedToken);
        setCustomerClient(client);
        setIsAuthenticated(true);
      }
    } catch (error) {
      if (debug) {
        console.error("Error checking auth status:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Diese useEffect wurde entfernt, da die Funktionalität in die checkAuthStatus-Funktion verschoben wurde

  // Wenn der Client verfügbar ist, lade Kundendaten
  useEffect(() => {
    if (customerClient && isAuthenticated) {
      refreshCustomer();
      refreshCart();
      refreshWishlists();
      refreshAddresses();
      refreshOrders();
    }
  }, [customerClient, isAuthenticated]);

  // Authentifizierungsfunktionen
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      if (!storeApiToken) {
        throw new Error("Store API Token fehlt");
      }

      // Verwende den PanaStoreClient für Login
      const { PanaStoreClient } = await import("@pana-commerce/pana-sdk");
      const storeClient = new PanaStoreClient(storeApiToken);

      const loginResult = await storeClient.login({
        email,
        password,
      });

      if (!loginResult || !loginResult.accessToken) {
        throw new Error("Login fehlgeschlagen");
      }

      // Token speichern
      await secureStorage.setItem("pana_auth_token", loginResult.accessToken);

      // Customer Client initialisieren
      const client = new PanaCustomerClient(loginResult.accessToken);
      setCustomerClient(client);
      setAuthToken(loginResult.accessToken);
      setIsAuthenticated(true);

      // Kundendaten laden
      const userData = await client.getMe();
      setCustomer(userData as Customer);

      setLoading(false);
      return true;
    } catch (error) {
      if (debug) {
        console.error("Login error:", error);
      }
      setError(error instanceof Error ? error.message : "Fehler beim Login");
      setLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await secureStorage.removeItem("pana_auth_token");
      setCustomerClient(null);
      setAuthToken(null);
      setIsAuthenticated(false);
      setCustomer(null);
      setCart(null);
      setWishlists(null);
      setAddresses(null);
      setOrders(null);
    } catch (error) {
      if (debug) {
        console.error("Logout error:", error);
      }
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      if (!storeApiToken) {
        throw new Error("Store API Token fehlt");
      }

      // Verwende den PanaStoreClient für Registrierung
      const { PanaStoreClient } = await import("@pana-commerce/pana-sdk");
      const storeClient = new PanaStoreClient(storeApiToken);

      const registerResult = await storeClient.register({
        email,
        password,
        phone: "",
        customPropertyValues: [],
        firstName,
        lastName,
        customerType: RegisterStoreCustomerDtoCustomerType.individual,
      });

      if (!registerResult) {
        throw new Error("Registrierung fehlgeschlagen");
      }

      // Nach erfolgreicher Registrierung einloggen
      return await login(email, password);
    } catch (error) {
      if (debug) {
        console.error("Register error:", error);
      }
      setError(
        error instanceof Error ? error.message : "Fehler bei der Registrierung"
      );
      setLoading(false);
      return false;
    }
  };

  const refreshCustomer = async (): Promise<void> => {
    if (!customerClient || !isAuthenticated) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userData = await customerClient.getMe();
      setCustomer(userData as Customer);
    } catch (error) {
      if (debug) {
        console.error("Error refreshing customer data:", error);
      }
      setError(
        error instanceof Error
          ? error.message
          : "Fehler beim Laden der Kundendaten"
      );

      if (error instanceof Error && error.message.includes("unauthorized")) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  /*  const updateCustomer = async (data: Partial<Customer>): Promise<Customer | null> => {
    if (!customerClient || !isAuthenticated) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedCustomer = await customerClient.updateMe(data);
      if (updatedCustomer) {
        setCustomer(updatedCustomer as Customer);
        return updatedCustomer as Customer;
      }
      return null;
    } catch (error) {
      if (debug) {
        console.error('Error updating customer:', error);
      }
      setError(
        error instanceof Error ? error.message : 'Fehler beim Aktualisieren der Kundendaten'
      );
      return null;
    } finally {
      setLoading(false);
    }
  }; */

  const changePassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    if (!customerClient || !isAuthenticated) {
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await customerClient.changeMyPassword({
        oldPassword,
        newPassword,
      });

      return !!result;
    } catch (error) {
      if (debug) {
        console.error("Error changing password:", error);
      }
      setError(
        error instanceof Error
          ? error.message
          : "Fehler beim Ändern des Passworts"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changeEmail = async (newEmail: string): Promise<boolean> => {
    if (!customerClient || !isAuthenticated) {
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await customerClient.changeMyEmail({
        newEmail,
      });

      return !!result;
    } catch (error) {
      if (debug) {
        console.error("Error changing email:", error);
      }
      setError(
        error instanceof Error
          ? error.message
          : "Fehler beim Ändern der E-Mail-Adresse"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Shopping Cart Funktionen
  const refreshCart = async (): Promise<void> => {
    if (!customerClient || !isAuthenticated) {
      return;
    }

    setCartLoading(true);
    setCartError(null);

    try {
      const cartData = await customerClient.getShoppingCart();
      setCart(cartData as ShoppingCart);
    } catch (error) {
      if (debug) {
        console.error("Error refreshing cart:", error);
      }
      setCartError(
        error instanceof Error
          ? error.message
          : "Fehler beim Laden des Warenkorbs"
      );
    } finally {
      setCartLoading(false);
    }
  };

  const addToCart = async (
    productId: number,
    amount: number
  ): Promise<boolean> => {
    if (!customerClient || !isAuthenticated) {
      return false;
    }

    setCartLoading(true);
    setCartError(null);

    try {
      const result = await customerClient.addShoppingCartItem(productId, {
        amount,
      });
      if (result) {
        setCart(result as ShoppingCart);
        return true;
      }
      return false;
    } catch (error) {
      if (debug) {
        console.error("Error adding to cart:", error);
      }
      setCartError(
        error instanceof Error
          ? error.message
          : "Fehler beim Hinzufügen zum Warenkorb"
      );
      return false;
    } finally {
      setCartLoading(false);
    }
  };

  const removeFromCart = async (itemId: number): Promise<boolean> => {
    if (!customerClient || !isAuthenticated) {
      return false;
    }

    setCartLoading(true);
    setCartError(null);

    try {
      const result = await customerClient.removeShoppingCartItem(itemId);
      if (result) {
        setCart(result as ShoppingCart);
        return true;
      }
      return false;
    } catch (error) {
      if (debug) {
        console.error("Error removing from cart:", error);
      }
      setCartError(
        error instanceof Error
          ? error.message
          : "Fehler beim Entfernen aus dem Warenkorb"
      );
      return false;
    } finally {
      setCartLoading(false);
    }
  };

  const clearCart = async (): Promise<boolean> => {
    if (!customerClient || !isAuthenticated) {
      return false;
    }

    setCartLoading(true);
    setCartError(null);

    try {
      const result = await customerClient.clearShoppingCart();
      if (result) {
        setCart(result as ShoppingCart);
        return true;
      }
      return false;
    } catch (error) {
      if (debug) {
        console.error("Error clearing cart:", error);
      }
      setCartError(
        error instanceof Error
          ? error.message
          : "Fehler beim Leeren des Warenkorbs"
      );
      return false;
    } finally {
      setCartLoading(false);
    }
  };

  const checkout = async (): Promise<any> => {
    if (!customerClient || !isAuthenticated) {
      return null;
    }

    setCartLoading(true);
    setCartError(null);

    try {
      const result = await customerClient.checkout();
      await refreshCart();
      return result;
    } catch (error) {
      if (debug) {
        console.error("Error during checkout:", error);
      }
      setCartError(
        error instanceof Error ? error.message : "Fehler beim Checkout"
      );
      return null;
    } finally {
      setCartLoading(false);
    }
  };

  // Wishlist Funktionen
  const refreshWishlists = async (): Promise<void> => {
    if (!customerClient || !isAuthenticated) {
      return;
    }

    setWishlistsLoading(true);
    setWishlistsError(null);

    try {
      const response = await customerClient.getAllWishlists({
        limit: 100,
        offset: 0,
      });

      if (response && response.data) {
        setWishlists(response.data as Wishlist[]);
      } else {
        setWishlists([]);
      }
    } catch (error) {
      if (debug) {
        console.error("Error refreshing wishlists:", error);
      }
      setWishlistsError(
        error instanceof Error
          ? error.message
          : "Fehler beim Laden der Wunschlisten"
      );
    } finally {
      setWishlistsLoading(false);
    }
  };

  const createWishlist = async (
    name: string,
    description?: string
  ): Promise<Wishlist | null> => {
    if (!customerClient || !isAuthenticated) {
      return null;
    }

    setWishlistsLoading(true);
    setWishlistsError(null);

    try {
      const wishlist = await customerClient.createWishlist({
        name,
        description,
      });

      await refreshWishlists();
      return wishlist as Wishlist;
    } catch (error) {
      if (debug) {
        console.error("Error creating wishlist:", error);
      }
      setWishlistsError(
        error instanceof Error
          ? error.message
          : "Fehler beim Erstellen der Wunschliste"
      );
      return null;
    } finally {
      setWishlistsLoading(false);
    }
  };

  const updateWishlist = async (
    wishlistId: number,
    name: string,
    description?: string
  ): Promise<Wishlist | null> => {
    if (!customerClient || !isAuthenticated) {
      return null;
    }

    setWishlistsLoading(true);
    setWishlistsError(null);

    try {
      const wishlist = await customerClient.updateWishlist(wishlistId, {
        name,
        description,
      });

      await refreshWishlists();
      return wishlist as Wishlist;
    } catch (error) {
      if (debug) {
        console.error("Error updating wishlist:", error);
      }
      setWishlistsError(
        error instanceof Error
          ? error.message
          : "Fehler beim Aktualisieren der Wunschliste"
      );
      return null;
    } finally {
      setWishlistsLoading(false);
    }
  };

  const deleteWishlist = async (wishlistId: number): Promise<boolean> => {
    if (!customerClient || !isAuthenticated) {
      return false;
    }

    setWishlistsLoading(true);
    setWishlistsError(null);

    try {
      const result = await customerClient.deleteWishlist(wishlistId);
      await refreshWishlists();
      return !!result;
    } catch (error) {
      if (debug) {
        console.error("Error deleting wishlist:", error);
      }
      setWishlistsError(
        error instanceof Error
          ? error.message
          : "Fehler beim Löschen der Wunschliste"
      );
      return false;
    } finally {
      setWishlistsLoading(false);
    }
  };

  const addToWishlist = async (
    wishlistId: number,
    productId: number
  ): Promise<boolean> => {
    if (!customerClient || !isAuthenticated) {
      return false;
    }

    setWishlistsLoading(true);
    setWishlistsError(null);

    try {
      const result = await customerClient.addWishlistItem(
        wishlistId,
        productId
      );
      await refreshWishlists();
      return !!result;
    } catch (error) {
      if (debug) {
        console.error("Error adding to wishlist:", error);
      }
      setWishlistsError(
        error instanceof Error
          ? error.message
          : "Fehler beim Hinzufügen zur Wunschliste"
      );
      return false;
    } finally {
      setWishlistsLoading(false);
    }
  };

  const removeFromWishlist = async (
    wishlistId: number,
    productId: number
  ): Promise<boolean> => {
    if (!customerClient || !isAuthenticated) {
      return false;
    }

    setWishlistsLoading(true);
    setWishlistsError(null);

    try {
      const result = await customerClient.removeWishlistItem(
        wishlistId,
        productId
      );
      await refreshWishlists();
      return !!result;
    } catch (error) {
      if (debug) {
        console.error("Error removing from wishlist:", error);
      }
      setWishlistsError(
        error instanceof Error
          ? error.message
          : "Fehler beim Entfernen aus der Wunschliste"
      );
      return false;
    } finally {
      setWishlistsLoading(false);
    }
  };

  const clearWishlist = async (wishlistId: number): Promise<boolean> => {
    if (!customerClient || !isAuthenticated) {
      return false;
    }

    setWishlistsLoading(true);
    setWishlistsError(null);

    try {
      const result = await customerClient.clearWishlist(wishlistId);
      await refreshWishlists();
      return !!result;
    } catch (error) {
      if (debug) {
        console.error("Error clearing wishlist:", error);
      }
      setWishlistsError(
        error instanceof Error
          ? error.message
          : "Fehler beim Leeren der Wunschliste"
      );
      return false;
    } finally {
      setWishlistsLoading(false);
    }
  };

  const refreshAddresses = async (): Promise<void> => {
    if (!customerClient || !isAuthenticated) {
      return;
    }

    setAddressesLoading(true);
    setAddressesError(null);

    try {
      const response = await customerClient.getAllAddresses({
        limit: 100,
        offset: 0,
      });

      if (response && response.data) {
        setAddresses(response.data as Address[]);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      if (debug) {
        console.error("Error refreshing addresses:", error);
      }
      setAddressesError(
        error instanceof Error
          ? error.message
          : "Fehler beim Laden der Adressen"
      );
    } finally {
      setAddressesLoading(false);
    }
  };

  const createAddress = async (
    addressData: Partial<Address>
  ): Promise<Address | null> => {
    if (!customerClient || !isAuthenticated) {
      return null;
    }

    setAddressesLoading(true);
    setAddressesError(null);

    try {
      const address = await customerClient.createAddress({
        country: addressData.country ?? "",
        state: addressData.state ?? "",
        city: addressData.city ?? "",
        street: addressData.street ?? "",
        building: addressData.building ?? "",
        postCode: addressData.postCode ?? "",
        primary: addressData.primary ?? false,
      });
      await refreshAddresses();
      return address as Address;
    } catch (error) {
      if (debug) {
        console.error("Error creating address:", error);
      }
      setAddressesError(
        error instanceof Error
          ? error.message
          : "Fehler beim Erstellen der Adresse"
      );
      return null;
    } finally {
      setAddressesLoading(false);
    }
  };

  const updateAddress = async (
    addressId: number,
    addressData: Partial<Address>
  ): Promise<Address | null> => {
    if (!customerClient || !isAuthenticated) {
      return null;
    }

    setAddressesLoading(true);
    setAddressesError(null);

    try {
      const address = await customerClient.updateAddress(
        addressId,
        addressData
      );
      await refreshAddresses();
      return address as Address;
    } catch (error) {
      if (debug) {
        console.error("Error updating address:", error);
      }
      setAddressesError(
        error instanceof Error
          ? error.message
          : "Fehler beim Aktualisieren der Adresse"
      );
      return null;
    } finally {
      setAddressesLoading(false);
    }
  };

  const deleteAddress = async (addressId: number): Promise<boolean> => {
    if (!customerClient || !isAuthenticated) {
      return false;
    }

    setAddressesLoading(true);
    setAddressesError(null);

    try {
      const result = await customerClient.deleteAddress(addressId);
      await refreshAddresses();
      return !!result;
    } catch (error) {
      if (debug) {
        console.error("Error deleting address:", error);
      }
      setAddressesError(
        error instanceof Error
          ? error.message
          : "Fehler beim Löschen der Adresse"
      );
      return false;
    } finally {
      setAddressesLoading(false);
    }
  };

  const setDefaultAddress = async (addressId: number): Promise<boolean> => {
    if (!customerClient || !isAuthenticated) {
      return false;
    }

    setAddressesLoading(true);
    setAddressesError(null);

    try {
      const result = await customerClient.setDefaultAddress(addressId);
      await refreshAddresses();
      return !!result;
    } catch (error) {
      if (debug) {
        console.error("Error setting default address:", error);
      }
      setAddressesError(
        error instanceof Error
          ? error.message
          : "Fehler beim Setzen der Standardadresse"
      );
      return false;
    } finally {
      setAddressesLoading(false);
    }
  };

  // Order Funktionen
  const refreshOrders = async (): Promise<void> => {
    if (!customerClient || !isAuthenticated) {
      return;
    }

    setOrdersLoading(true);
    setOrdersError(null);

    try {
      const response = await customerClient.getAllOrders({
        limit: 100,
        offset: 0,
      });

      if (response && response.data) {
        setOrders(response.data as Order[]);
      } else {
        setOrders([]);
      }
    } catch (error) {
      if (debug) {
        console.error("Error refreshing orders:", error);
      }
      setOrdersError(
        error instanceof Error
          ? error.message
          : "Fehler beim Laden der Bestellungen"
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  const getOrder = async (orderId: number): Promise<Order | null> => {
    if (!customerClient || !isAuthenticated) {
      return null;
    }

    setOrdersLoading(true);
    setOrdersError(null);

    try {
      const order = await customerClient.getOrder(orderId);
      return order as Order;
    } catch (error) {
      if (debug) {
        console.error(`Error getting order ${orderId}:`, error);
      }
      setOrdersError(
        error instanceof Error
          ? error.message
          : "Fehler beim Laden der Bestellung"
      );
      return null;
    } finally {
      setOrdersLoading(false);
    }
  };

  /*  const createOrder = async (orderData: {
    comment?: string;
    addressId: number;
  }): Promise<Order | null> => {
    if (!customerClient || !isAuthenticated) {
      return null;
    }

    setOrdersLoading(true);
    setOrdersError(null);

    try {
      const order = await customerClient.createOrder(orderData);
      await refreshOrders();
      if (!order) return null;
      return order as Order;
    } catch (error) {
      if (debug) {
        console.error('Error creating order:', error);
      }
      setOrdersError(
        error instanceof Error ? error.message : 'Fehler beim Erstellen der Bestellung'
      );
      return null;
    } finally {
      setOrdersLoading(false);
    }
  }; */

  const contextValue: PanaCustomerContextType = {
    customerClient,
    isAuthenticated,
    authToken,

    customer,
    loading,
    error,

    cart,
    cartLoading,
    cartError,
    refreshCart,
    addToCart,
    removeFromCart,
    clearCart,
    checkout,

    wishlists,
    wishlistsLoading,
    wishlistsError,
    refreshWishlists,
    createWishlist,
    updateWishlist,
    deleteWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,

    addresses,
    addressesLoading,
    addressesError,
    refreshAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,

    orders,
    ordersLoading,
    ordersError,
    refreshOrders,
    getOrder,
    // createOrder,

    login,
    logout,
    register,
    refreshCustomer,
    // updateCustomer,
    changePassword,
    changeEmail,
  };

  return (
    <PanaCustomerContext.Provider value={contextValue}>
      {children}
    </PanaCustomerContext.Provider>
  );
};
