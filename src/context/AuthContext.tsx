import React, { createContext, useState, useEffect, ReactNode } from "react";
import { PanaStoreClient, PanaCustomerClient } from "@pana-commerce/pana-sdk";
import { initSecurity, secureStorage } from "../utils/security";
import type {
  StoreCustomer,
  User,
} from "@pana-commerce/pana-sdk/dist/public-api";

const getStoreApiToken = (): string => {
  try {
    return import.meta.env?.VITE_PANA_STORE_API_TOKEN || "";
  } catch (e) {
    console.error("Fehler beim Zugriff auf Umgebungsvariablen:", e);
    return "";
  }
};

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | StoreCustomer | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    customPropertyValues: []
    test: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  storeClient: PanaStoreClient | null;
  customerClient: PanaCustomerClient | null;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  storeClient: null,
  customerClient: null,
});

interface AuthProviderProps {
  children: ReactNode;
  apiKey: string;
  shopId: string;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  apiKey,
  shopId,
}) => {
  const STORE_API_TOKEN = getStoreApiToken();

  console.debug("ENV Check - STORE_API_TOKEN:", {
    isDefined: !!STORE_API_TOKEN,
    value: STORE_API_TOKEN
      ? `${STORE_API_TOKEN.substring(0, 4)}...`
      : "nicht gesetzt",
    fullImportMeta: import.meta,
    availableEnvVars: Object.keys(import.meta.env || {}).join(", "),
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | StoreCustomer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [storeClient, setStoreClient] = useState<PanaStoreClient | null>(null);
  const [customerClient, setCustomerClient] =
    useState<PanaCustomerClient | null>(null);

  // Initialisierung der Security-Utils mit der shopId
  useEffect(() => {
    if (shopId) {
      initSecurity(shopId);
    } else {
      console.error("PANA SDK: Keine Shop-ID in der Konfiguration gefunden");
    }
  }, [shopId]);

  useEffect(() => {
    if (!STORE_API_TOKEN) {
      console.error(
        "PANA SDK: Store API Token fehlt. Bitte in .env als VITE_PANA_STORE_API_TOKEN setzen."
      );
      return;
    }

    const client = new PanaStoreClient(STORE_API_TOKEN);
    setStoreClient(client);
  }, []);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        if (!storeClient) {
          return;
        }

        const storedToken = await secureStorage.getItem("pana_auth_token");

        if (storedToken) {
          const client = new PanaCustomerClient(storedToken);
          setCustomerClient(client);

          try {
            const userData = await client.getMe();
            if (userData) {
              setUser(userData);
              setToken(storedToken);
              setIsAuthenticated(true);
            } else {
              await secureStorage.removeItem("pana_auth_token");
            }
          } catch (error) {
            console.error("Error validating token:", error);
            await secureStorage.removeItem("pana_auth_token");
          }
        }
      } catch (error) {
        console.error("Authentication check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, [storeClient]);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!storeClient) {
      setError("Store client not initialized");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const authResponse = await storeClient.login({
        email,
        password,
      });

      if (!authResponse || !authResponse.accessToken) {
        setError("Login failed");
        setLoading(false);
        return false;
      }

      await secureStorage.setItem("pana_auth_token", authResponse.accessToken);

      const client = new PanaCustomerClient(authResponse.accessToken);
      setCustomerClient(client);

      const userData = await client.getMe();

      if (userData) {
        setUser(userData);
        setToken(authResponse.accessToken);
        setIsAuthenticated(true);
        setLoading(false);
        return true;
      } else {
        setError("Failed to retrieve user data");
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error instanceof Error ? error.message : "Network error during login"
      );
      setLoading(false);
      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    customPropertyValues: []
  ): Promise<boolean> => {
    if (!storeClient) {
      setError("Store client not initialized");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const registrationResult = await storeClient.register({
        email,
        password,
        firstName,
        lastName,
        customPropertyValues,
      });

      if (!registrationResult) {
        setError("Registration failed");
        setLoading(false);
        return false;
      }

      return await login(email, password);
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Network error during registration"
      );
      setLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setCustomerClient(null);
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);

      await secureStorage.removeItem("pana_auth_token");
    } catch (error) {
      console.error("Logout error:", error);
      setError(error instanceof Error ? error.message : "Error during logout");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        storeClient,
        customerClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
