import { useContext } from 'react';
import { PanaCustomerContext } from '../context/PanaCustomerContext';
import type { ShoppingCart } from '../context/PanaCustomerContext';

interface UsePanaCartReturn {
  // Cart data
  cart: ShoppingCart | null;
  cartLoading: boolean;
  cartError: string | null;

  // Cart operations
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, amount: number) => Promise<boolean>;
  removeFromCart: (itemId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  checkout: () => Promise<any>;

  // Authentication status (useful for checking if user can add to cart)
  isAuthenticated: boolean;
}

export const usePanaCart = (): UsePanaCartReturn => {
  const {
    cart,
    cartLoading,
    cartError,
    refreshCart,
    addToCart,
    removeFromCart,
    clearCart,
    checkout,
    isAuthenticated,
  } = useContext(PanaCustomerContext);

  return {
    cart,
    cartLoading,
    cartError,
    refreshCart,
    addToCart,
    removeFromCart,
    clearCart,
    checkout,
    isAuthenticated,
  };
};

export default usePanaCart;
