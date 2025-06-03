import React from "react";
import { useStore } from "../../contexts/StoreContext";
import Login from "./atoms/Login";
import styles from "./Header.module.scss";

const Header = () => {
  const { store } = useStore();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <h1>{store.name}</h1>
        </div>
        <nav className={styles.nav}>
          <ul>
            <li>Home</li>
            <li>Products</li>
            <li>Cart</li>
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
