import React from "react";
import styles from "./Cart.module.scss";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  itemCount: number;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, itemCount }) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
        onClick={handleOverlayClick}
      />
      
      {/* Cart Modal */}
      <div className={`${styles.cartModal} ${isOpen ? styles.cartModalOpen : ''}`}>
        <div className={styles.cartHeader}>
          <h2 className={styles.cartTitle}>Warenkorb ({itemCount})</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className={styles.cartContent}>
          {itemCount === 0 ? (
            <div className={styles.emptyCart}>
              <div className={styles.emptyCartIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13H17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Ihr Warenkorb ist leer</h3>
              <p>Fügen Sie Produkte hinzu, um zu beginnen</p>
            </div>
          ) : (
            <div className={styles.cartItems}>
              {/* Hier werden später die Warenkorb-Items angezeigt */}
              <p>Warenkorb-Items werden hier angezeigt</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
