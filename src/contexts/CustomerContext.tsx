import React, { createContext, useContext, useState, useEffect } from "react";
import { login, getCurrentUser, logout } from "../services/customer";

type Customer = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
};

type CustomerContextType = {
  customer: Customer | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<Customer | null>;
  logout: () => void;
};

const CustomerContext = createContext<CustomerContextType | null>(null);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setCustomer(userData);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        logout();
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const userData = await login(email, password);
      setCustomer(userData);
      return userData;
    } catch (error) {
      console.error("Login failed:", error);
      return null;
    }
  };

  const handleLogout = () => {
    logout();
    setCustomer(null);
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);

  if (!context) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }

  return context;
};
