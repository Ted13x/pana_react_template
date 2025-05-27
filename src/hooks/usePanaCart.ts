import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import type { ShoppingCart, ShoppingCartItem } from "../context/CartContext";

interface UsePanaCartReturn {
  // Cart data
  cart: ShoppingCart | null;
  cartItems: ShoppingCartItem[];
  cartTotal: number;
  itemCount: number;
  loading: boolean;
  error: string | null;

  // Cart operations
  addToCart: (variantId: number, quantity?: number) => Promise<boolean>;
  removeFromCart: (cartItemId: number) => Promise<boolean>;
  updateCartItemQuantity: (
    cartItemId: number,
    quantity: number
  ) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

export const usePanaCart = (): UsePanaCartReturn => {
  const {
    cart,
    cartItems,
    cartTotal,
    itemCount,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    refreshCart,
  } = useContext(CartContext);

  return {
    cart,
    cartItems,
    cartTotal,
    itemCount,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    refreshCart,
  };
};

export default usePanaCart;
