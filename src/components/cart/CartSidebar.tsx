import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePanaCart } from "../../hooks/usePanaCart";
import { usePanaAuth } from "../../hooks/usePanaAuth";
import styles from "./CartSidebar.module.scss";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const {
    cartItems,
    cartTotal,
    itemCount,
    removeFromCart,
    updateCartItemQuantity,
    loading,
  } = usePanaCart();
  const { isAuthenticated } = usePanaAuth();

  // Schließe Sidebar bei Klick außerhalb
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Verhindere Scrollen des Body wenn Sidebar offen ist
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // ESC-Taste zum Schließen
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const formatPrice = (price: number, currency: string = "EUR") => {
    return price.toLocaleString("de-DE", {
      style: "currency",
      currency: currency,
    });
  };

  const getMainCurrency = () => {
    if (cartItems.length > 0) {
      const firstItemWithPrice = cartItems.find(
        (item) => item.variant?.prices && item.variant.prices.length > 0
      );
      return firstItemWithPrice?.variant?.prices?.[0]?.currency || "EUR";
    }
    return "EUR";
  };

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateCartItemQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    await removeFromCart(itemId);
  };

  const handleBackToShopping = () => {
    onClose();
    navigate("/");
  };

  const handleCheckout = () => {
    onClose();
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          redirect: "/checkout",
          message: "Bitte melden Sie sich an, um zur Kasse zu gehen.",
        },
      });
    } else {
      navigate("/checkout");
    }
  };

  const handleProductClick = (productId: number) => {
    onClose();
    navigate(`/product/${productId}`);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`${styles.cartSidebar} ${isOpen ? styles.open : ""}`}
      >
        {/* Header */}
        <div className={styles.sidebarHeader}>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Warenkorb schließen"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <h2 className={styles.sidebarTitle}>
            Your shopping cart is {itemCount === 0 ? "empty" : `(${itemCount})`}
          </h2>
        </div>

        {/* Content */}
        <div className={styles.sidebarContent}>
          {itemCount === 0 ? (
            <div className={styles.emptyCart}>
              <p className={styles.emptyMessage}>Your shopping cart is empty</p>
              <button
                className={styles.backToShoppingButton}
                onClick={handleBackToShopping}
              >
                Back to shopping
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className={styles.cartItems}>
                {cartItems.map((item) => (
                  <div key={item.id} className={styles.cartItem}>
                    {/* Product Image */}
                    {item.variant?.medias && item.variant.medias.length > 0 && (
                      <div
                        className={styles.itemImage}
                        onClick={() =>
                          item.variant?.name &&
                          handleProductClick(item.variant.id)
                        }
                      >
                        <img
                          src={item.variant.medias[0].url}
                          alt={item.variant.name || "Produkt"}
                        />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className={styles.itemInfo}>
                      <h3
                        className={styles.itemName}
                        onClick={() =>
                          item.variant?.name &&
                          handleProductClick(item.variant.id)
                        }
                      >
                        {item.variant?.name || "Unbekanntes Produkt"}
                      </h3>

                      {/* Quantity Controls */}
                      <div className={styles.quantityControls}>
                        <button
                          className={styles.quantityButton}
                          onClick={() =>
                            handleQuantityChange(item.id, item.amount - 1)
                          }
                          disabled={loading || item.amount <= 1}
                        >
                          −
                        </button>
                        <span className={styles.quantity}>{item.amount}</span>
                        <button
                          className={styles.quantityButton}
                          onClick={() =>
                            handleQuantityChange(item.id, item.amount + 1)
                          }
                          disabled={loading}
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className={styles.itemPrice}>
                        {item.variant?.prices && item.variant.prices.length > 0
                          ? formatPrice(
                              parseFloat(
                                item.variant.prices[0].value.toString()
                              ) * item.amount,
                              item.variant.prices[0].currency
                            )
                          : "Preis nicht verfügbar"}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={loading}
                      aria-label="Artikel entfernen"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6l-2 14H7L5 6"></path>
                        <path d="M10 11v6"></path>
                        <path d="M14 11v6"></path>
                        <path d="M5 6l1-2h12l1 2"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className={styles.sidebarFooter}>
                <div className={styles.subtotalSection}>
                  <div className={styles.subtotal}>
                    <span>Subtotal</span>
                    <span className={styles.price}>
                      {formatPrice(cartTotal, getMainCurrency())}
                    </span>
                  </div>
                  <p className={styles.shippingNote}>
                    Shipping and taxes calculated at checkout
                  </p>
                </div>

                <button
                  className={styles.checkoutButton}
                  onClick={handleCheckout}
                  disabled={loading || itemCount === 0}
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
