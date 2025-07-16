// src/services/customer.ts

import { PanaStoreClient, PanaCustomerClient } from "@pana-commerce/pana-sdk";
import { setCookie, getCookie, deleteCookie } from "../utils/cookies";

const STORE_API_TOKEN = import.meta.env.VITE_PANA_STORE_API_TOKEN;

let storeClient: PanaStoreClient | null = null;
let customerClient: PanaCustomerClient | null = null;

const getStoreClient = (): PanaStoreClient => {
  if (!storeClient) {
    storeClient = new PanaStoreClient(STORE_API_TOKEN);
  }
  return storeClient;
};

export const login = async (email: string, password: string) => {
  const client = getStoreClient();
  const response = await client.login({
    email,
    password,
  });

  if (response && response.accessToken) {
    setCookie("auth_token", response.accessToken);
    customerClient = new PanaCustomerClient(response.accessToken);
    return response.customer;
  }

  throw new Error("Login failed");
};

export const getCurrentUser = async () => {
  const currentToken = getCookie("auth_token");
  
  if (!currentToken) {
    return null;
  }

  if (!customerClient) {
    customerClient = new PanaCustomerClient(currentToken);
  }

  const userData = await customerClient.getCustomer();
  return userData;
};

export const getAllCustomerAddresses = async () => {
  const currentToken = getCookie("auth_token");
  
  if (!currentToken) {
    return null;
  }

  if (!customerClient) {
    customerClient = new PanaCustomerClient(currentToken);
  }

  const addresses = await customerClient.getAllAddresses({});
  return addresses;
};

export const logout = () => {
  deleteCookie("auth_token");
  customerClient = null;
};

export const addShoppingCartItem = async (
  productVariantId: number,
  quantity: number = 1
) => {
  const currentToken = getCookie("auth_token");
  
  if (!currentToken) {
    throw new Error("User not authenticated");
  }

  if (!customerClient) {
    customerClient = new PanaCustomerClient(currentToken);
  }

  const cartItem = await customerClient.addShoppingCartItem(productVariantId, {
    amount: quantity,
  });

  return cartItem;
};
