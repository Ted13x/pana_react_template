// src/services/customer.ts

import { PanaStoreClient, PanaCustomerClient } from "@pana-commerce/pana-sdk";
import { setCookie, getCookie, deleteCookie } from "../utils/cookies";

const STORE_API_TOKEN = import.meta.env.VITE_PANA_STORE_API_TOKEN;

let storeClient: PanaStoreClient | null = null;
let customerClient: PanaCustomerClient | null = null;

const token = getCookie("auth_token");

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
  if (!token) {
    return null;
  }

  if (!customerClient) {
    customerClient = new PanaCustomerClient(token);
  }

  const userData = await customerClient.getMe();
  return userData;
};

export const getAllCustomerAddresses = async () => {
  if (!token) {
    return null;
  }

  if (!customerClient) {
    customerClient = new PanaCustomerClient(token);
  }

  const addresses = await customerClient.getAllAddresses({});
  return addresses;
};

export const logout = () => {
  deleteCookie("auth_token");
  customerClient = null;
};
