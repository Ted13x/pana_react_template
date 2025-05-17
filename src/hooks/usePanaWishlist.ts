import { useContext } from 'react';
import { PanaCustomerContext } from '../context/PanaCustomerContext';
import type { Wishlist } from '../context/PanaCustomerContext';

interface UsePanaWishlistReturn {
  // Wishlist data
  wishlists: Wishlist[] | null;
  wishlistsLoading: boolean;
  wishlistsError: string | null;

  // Wishlist operations
  refreshWishlists: () => Promise<void>;
  createWishlist: (name: string, description?: string) => Promise<Wishlist | null>;
  updateWishlist: (
    wishlistId: number,
    name: string,
    description?: string
  ) => Promise<Wishlist | null>;
  deleteWishlist: (wishlistId: number) => Promise<boolean>;

  // Wishlist item operations
  addToWishlist: (wishlistId: number, productId: number) => Promise<boolean>;
  removeFromWishlist: (wishlistId: number, productId: number) => Promise<boolean>;
  clearWishlist: (wishlistId: number) => Promise<boolean>;

  // Authentication status (useful for checking if user can manage wishlists)
  isAuthenticated: boolean;
}

export const usePanaWishlist = (): UsePanaWishlistReturn => {
  const {
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
    isAuthenticated,
  } = useContext(PanaCustomerContext);

  return {
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
    isAuthenticated,
  };
};

export default usePanaWishlist;
