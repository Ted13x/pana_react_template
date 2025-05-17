import { useContext } from 'react';
import { PanaStoreContext } from '../context/PanaStoreContext';
import type { Product, ProductsQueryParams } from '../context/PanaStoreContext';

interface UsePanaProductsReturn {
  // Products data
  products: Product[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  productsLoading: boolean;
  productsError: string | null;

  // Products operations
  fetchProducts: (params?: ProductsQueryParams) => Promise<void>;

  // Search and filter
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
}

export const usePanaProducts = (): UsePanaProductsReturn => {
  const {
    products,
    totalProducts,
    currentPage,
    totalPages,
    productsLoading,
    productsError,
    fetchProducts,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortOption,
    setSortOption,
  } = useContext(PanaStoreContext);

  return {
    products,
    totalProducts,
    currentPage,
    totalPages,
    productsLoading,
    productsError,
    fetchProducts,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortOption,
    setSortOption,
  };
};

export default usePanaProducts;
