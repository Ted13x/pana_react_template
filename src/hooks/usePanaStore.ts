import { useContext } from 'react';
import { PanaStoreContext } from '../context/PanaStoreContext';
import type { Store } from '../context/PanaStoreContext';

interface UsePanaStoreReturn {
  // Store information
  store: Store | null;
  storeLoading: boolean;
  storeError: string | null;
  refreshStore: () => Promise<void>;

  // Configuration
  config: {
    storeApiToken: string;
    shopId: string;
    apiBaseUrl?: string;
    debug?: boolean;
  };
}

export const usePanaStore = (): UsePanaStoreReturn => {
  const { store, storeLoading, storeError, refreshStore, config } = useContext(PanaStoreContext);

  return {
    store,
    storeLoading,
    storeError,
    refreshStore,
    config,
  };
};

export default usePanaStore;
