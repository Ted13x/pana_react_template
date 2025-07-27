import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../contexts/StoreContext";
import { useCart } from "../../contexts/CartContext";
import Login from "./atoms/Login";
import styles from "./Header.module.scss";

const Header = () => {
  const navigate = useNavigate();
  const { store } = useStore();
  const { openCart, itemCount } = useCart();

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <h1 onClick={handleLogoClick} className={styles.logoText}>
            {store.name}
          </h1>
        </div>
        <nav className={styles.nav}>
          <ul>
            <li>
              <button className={styles.cartButton} onClick={openCart}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13H17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Cart
                {itemCount > 0 && (
                  <span className={styles.cartBadge}>{itemCount}</span>
                )}
              </button>
            </li>
            <li>
              <Login />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
