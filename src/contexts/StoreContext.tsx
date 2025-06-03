// src/contexts/StoreContext.tsx

import React, { createContext, useContext, ReactNode } from "react";
import { Store, Product } from "../panaTypes";
import { storeResource, productsResource } from "../services/store";

type StoreContextType = {
  store: Store;
  products: Product[];
};

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const store = storeResource.read();
  const products = productsResource.read();

  return (
    <StoreContext.Provider
      value={{
        store,
        products,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
