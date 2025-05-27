import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import { ConfigContext } from "./ConfigContext";
import { PanaCustomerContext } from "./PanaCustomerContext";
import type { components } from "@pana-commerce/pana-sdk/dist/public-api";

// Typen aus der SDK
export type ShoppingCart = components["schemas"]["StoreCustomerShoppingCart"];
export type ShoppingCartItem =
  components["schemas"]["StoreCustomerShoppingCartItem"];
export type ProductVariant = components["schemas"]["StoreProductVariant"];

export interface CartContextType {
  // Cart Daten
  cart: ShoppingCart | null;
  cartItems: ShoppingCartItem[];
  cartTotal: number;
  itemCount: number;
  loading: boolean;
  error: string | null;

  // Cart Operationen
  addToCart: (variantId: number, quantity?: number) => Promise<boolean>;
  removeFromCart: (cartItemId: number) => Promise<boolean>;
  updateCartItemQuantity: (
    cartItemId: number,
    quantity: number
  ) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;

  // Wishlist (für später)
  wishlistItems: any[];
  addToWishlist: (item: any) => void;
  removeFromWishlist: (id: string) => void;
  moveToCart: (wishlistItemId: string) => void;
}

export const CartContext = createContext<CartContextType>({
  cart: null,
  cartItems: [],
  cartTotal: 0,
  itemCount: 0,
  loading: false,
  error: null,
  addToCart: async () => false,
  removeFromCart: async () => false,
  updateCartItemQuantity: async () => false,
  clearCart: async () => false,
  refreshCart: async () => {},
  wishlistItems: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  moveToCart: () => {},
});

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // Context Hooks
  const { shopId, debug } = useContext(ConfigContext);
  const {
    customerClient,
    isAuthenticated,
    cart: customerCart,
    cartLoading,
    cartError,
    refreshCart: refreshCustomerCart,
    addToCart: addToCustomerCart,
    removeFromCart: removeFromCustomerCart,
    clearCart: clearCustomerCart,
  } = useContext(PanaCustomerContext);

  // Lokale States für Gäste
  const [localCart, setLocalCart] = useState<ShoppingCartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  // Berechne Cart-Werte basierend auf Authentifizierungsstatus
  const cart = isAuthenticated ? customerCart : null;
  const cartItems = isAuthenticated
    ? customerCart?.shoppingCartItems || []
    : localCart;

  // Berechne den Gesamtpreis
  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.variant?.prices?.[0]?.value || 0;
    return total + Number(price) * item.amount;
  }, 0);

  // Berechne die Anzahl der Artikel
  const itemCount = cartItems.reduce((count, item) => count + item.amount, 0);

  // Loading und Error States
  const loading = isAuthenticated ? cartLoading : false;
  const error = isAuthenticated ? cartError : null;

  // Lade lokalen Cart beim Start (für Gäste)
  useEffect(() => {
    if (!isAuthenticated) {
      const storedCart = localStorage.getItem(`pana_guest_cart_${shopId}`);
      if (storedCart) {
        try {
          setLocalCart(JSON.parse(storedCart));
        } catch (error) {
          console.error("Fehler beim Laden des lokalen Warenkorbs:", error);
        }
      }
    }
  }, [isAuthenticated, shopId]);

  // Speichere lokalen Cart bei Änderungen (für Gäste)
  useEffect(() => {
    if (!isAuthenticated && localCart.length > 0) {
      localStorage.setItem(
        `pana_guest_cart_${shopId}`,
        JSON.stringify(localCart)
      );
    }
  }, [localCart, isAuthenticated, shopId]);

  // Cart Operationen
  const addToCart = async (
    variantId: number,
    quantity: number = 1
  ): Promise<boolean> => {
    if (debug) {
      console.log("CartContext: addToCart aufgerufen", {
        variantId,
        quantity,
        isAuthenticated,
      });
    }

    if (isAuthenticated && customerClient) {
      // Authentifizierter Benutzer: API aufrufen
      try {
        const success = await addToCustomerCart(variantId, quantity);
        if (debug) {
          console.log(
            "CartContext: Artikel erfolgreich zum Cart hinzugefügt",
            success
          );
        }
        return success;
      } catch (error) {
        console.error("CartContext: Fehler beim Hinzufügen zum Cart:", error);
        return false;
      }
    } else {
      // Gast: Lokal speichern
      // Für Gäste müssen wir die Varianten-Details separat laden
      // Das ist eine vereinfachte Version - in Produktion würde man die Varianten-Details cachen
      const existingItemIndex = localCart.findIndex(
        (item) => item.variant?.id === variantId
      );

      if (existingItemIndex >= 0) {
        // Artikel existiert bereits, Menge erhöhen
        const updatedCart = [...localCart];
        updatedCart[existingItemIndex].amount += quantity;
        setLocalCart(updatedCart);
      } else {
        // Neuer Artikel - wir erstellen ein minimales CartItem
        // In einer echten Implementierung würden wir hier die Varianten-Details laden
        const newItem: ShoppingCartItem = {
          id: Date.now(), // Temporäre ID für lokale Items
          amount: quantity,
          variant: { id: variantId } as ProductVariant,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          uuid: `local-${Date.now()}`,
        } as ShoppingCartItem;

        setLocalCart([...localCart, newItem]);
      }

      if (debug) {
        console.log("CartContext: Artikel lokal zum Gast-Cart hinzugefügt");
      }
      return true;
    }
  };

  const removeFromCart = async (cartItemId: number): Promise<boolean> => {
    if (debug) {
      console.log("CartContext: removeFromCart aufgerufen", {
        cartItemId,
        isAuthenticated,
      });
    }

    if (isAuthenticated && customerClient) {
      // Authentifizierter Benutzer: API aufrufen
      try {
        const success = await removeFromCustomerCart(cartItemId);
        if (debug) {
          console.log(
            "CartContext: Artikel erfolgreich aus Cart entfernt",
            success
          );
        }
        return success;
      } catch (error) {
        console.error("CartContext: Fehler beim Entfernen aus Cart:", error);
        return false;
      }
    } else {
      // Gast: Lokal entfernen
      setLocalCart(localCart.filter((item) => item.id !== cartItemId));
      if (debug) {
        console.log("CartContext: Artikel lokal aus Gast-Cart entfernt");
      }
      return true;
    }
  };

  const updateCartItemQuantity = async (
    cartItemId: number,
    quantity: number
  ): Promise<boolean> => {
    if (debug) {
      console.log("CartContext: updateCartItemQuantity aufgerufen", {
        cartItemId,
        quantity,
        isAuthenticated,
      });
    }

    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }

    if (isAuthenticated && customerClient) {
      // Für authentifizierte Benutzer: Entfernen und neu hinzufügen
      // Die API bietet keine direkte Update-Funktion
      const item = cartItems.find((item) => item.id === cartItemId);
      if (!item || !item.variant) return false;

      try {
        // Erst entfernen
        await removeFromCustomerCart(cartItemId);
        // Dann mit neuer Menge hinzufügen
        const success = await addToCustomerCart(item.variant.id, quantity);
        return success;
      } catch (error) {
        console.error(
          "CartContext: Fehler beim Aktualisieren der Menge:",
          error
        );
        return false;
      }
    } else {
      // Gast: Lokal aktualisieren
      const updatedCart = localCart.map((item) =>
        item.id === cartItemId ? { ...item, amount: quantity } : item
      );
      setLocalCart(updatedCart);
      if (debug) {
        console.log("CartContext: Menge lokal im Gast-Cart aktualisiert");
      }
      return true;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    if (debug) {
      console.log("CartContext: clearCart aufgerufen", { isAuthenticated });
    }

    if (isAuthenticated && customerClient) {
      // Authentifizierter Benutzer: API aufrufen
      try {
        const success = await clearCustomerCart();
        if (debug) {
          console.log("CartContext: Cart erfolgreich geleert", success);
        }
        return success;
      } catch (error) {
        console.error("CartContext: Fehler beim Leeren des Carts:", error);
        return false;
      }
    } else {
      // Gast: Lokal leeren
      setLocalCart([]);
      localStorage.removeItem(`pana_guest_cart_${shopId}`);
      if (debug) {
        console.log("CartContext: Gast-Cart lokal geleert");
      }
      return true;
    }
  };

  const refreshCart = async (): Promise<void> => {
    if (debug) {
      console.log("CartContext: refreshCart aufgerufen", { isAuthenticated });
    }

    if (isAuthenticated && customerClient) {
      await refreshCustomerCart();
    }
    // Für Gäste gibt es nichts zu refreshen, da alles lokal ist
  };

  // Wishlist-Funktionen (Platzhalter für später)
  const addToWishlist = (item: any) => {
    if (!wishlistItems.some((i) => i.productId === item.productId)) {
      setWishlistItems([
        ...wishlistItems,
        { ...item, id: Date.now().toString() },
      ]);
    }
  };

  const removeFromWishlist = (id: string) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== id));
  };

  const moveToCart = async (wishlistItemId: string) => {
    const item = wishlistItems.find((item) => item.id === wishlistItemId);
    if (item && item.variantId) {
      const success = await addToCart(item.variantId, 1);
      if (success) {
        removeFromWishlist(wishlistItemId);
      }
    }
  };

  // Beim Login: Lokalen Cart mit Server synchronisieren
  useEffect(() => {
    const syncLocalCartToServer = async () => {
      if (isAuthenticated && customerClient && localCart.length > 0) {
        if (debug) {
          console.log("CartContext: Synchronisiere lokalen Cart mit Server");
        }

        // Füge alle lokalen Items zum Server-Cart hinzu
        for (const item of localCart) {
          if (item.variant?.id) {
            try {
              await addToCustomerCart(item.variant.id, item.amount);
            } catch (error) {
              console.error(
                "Fehler beim Synchronisieren des Cart-Items:",
                error
              );
            }
          }
        }

        // Lokalen Cart leeren
        setLocalCart([]);
        localStorage.removeItem(`pana_guest_cart_${shopId}`);
      }
    };

    syncLocalCartToServer();
  }, [isAuthenticated, customerClient]);

  const contextValue: CartContextType = {
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
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};
