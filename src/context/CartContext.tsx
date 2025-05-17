import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';
import { ConfigContext } from './ConfigContext';
import { AuthContext } from './AuthContext';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  attributes?: Record<string, string>;
}

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
}

export interface CartContextType {
  cartItems: CartItem[];
  wishlistItems: WishlistItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (item: Omit<WishlistItem, 'id'>) => void;
  removeFromWishlist: (id: string) => void;
  moveToCart: (wishlistItemId: string) => void;
  cartTotal: number;
  itemCount: number;
}

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  wishlistItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateCartItemQuantity: () => {},
  clearCart: () => {},
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  moveToCart: () => {},
  cartTotal: 0,
  itemCount: 0,
});

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const { apiKey, shopId } = useContext(ConfigContext);
  const { isAuthenticated, token } = useContext(AuthContext);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  useEffect(() => {
    const loadCartData = async () => {
      if (isAuthenticated && token) {
        try {
          // In einer echten Implementierung würden hier die Daten vom Server geladen
          // Beispiel für die Implementierung mit einer API
          // const cartData = await cartService.getCart(token, apiKey, shopId);
          // setCartItems(cartData.items);

          // Für jetzt nutzen wir lokale Daten
          const localCartData = localStorage.getItem(`pana_cart_${shopId}`);
          if (localCartData) {
            setCartItems(JSON.parse(localCartData));
          }

          const localWishlistData = localStorage.getItem(`pana_wishlist_${shopId}`);
          if (localWishlistData) {
            setWishlistItems(JSON.parse(localWishlistData));
          }
        } catch (error) {
          console.error('Fehler beim Laden der Warenkorb-Daten:', error);
        }
      }
    };

    loadCartData();
  }, [isAuthenticated, token, apiKey, shopId]);

  useEffect(() => {
    const saveCartData = async () => {
      try {
        // In einer echten Implementierung würden die Daten zum Server gesendet
        // Beispiel für die Implementierung mit einer API
        // if (isAuthenticated && token) {
        //   await cartService.updateCart(cartItems, token, apiKey, shopId);
        // }

        // Für jetzt speichern wir lokal
        localStorage.setItem(`pana_cart_${shopId}`, JSON.stringify(cartItems));
      } catch (error) {
        console.error('Fehler beim Speichern der Warenkorb-Daten:', error);
      }
    };

    saveCartData();
  }, [cartItems, isAuthenticated, token, apiKey, shopId]);

  useEffect(() => {
    localStorage.setItem(`pana_wishlist_${shopId}`, JSON.stringify(wishlistItems));
  }, [wishlistItems, shopId]);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const existingItemIndex = cartItems.findIndex(i => i.productId === item.productId);

    if (existingItemIndex >= 0) {
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += item.quantity || 1;
      setCartItems(updatedItems);
    } else {
      setCartItems([...cartItems, { ...item, id }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const updateCartItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems(cartItems.map(item => (item.id === id ? { ...item, quantity } : item)));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const addToWishlist = (item: Omit<WishlistItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);

    if (!wishlistItems.some(i => i.productId === item.productId)) {
      setWishlistItems([...wishlistItems, { ...item, id }]);
    }
  };

  const removeFromWishlist = (id: string) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id));
  };

  const moveToCart = (wishlistItemId: string) => {
    const item = wishlistItems.find(item => item.id === wishlistItemId);

    if (item) {
      addToCart({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: 1,
        imageUrl: item.imageUrl,
      });

      removeFromWishlist(wishlistItemId);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        moveToCart,
        cartTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
