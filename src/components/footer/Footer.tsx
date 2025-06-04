import React from "react";
import styles from "./Footer.module.scss";
import { useStore } from "../../contexts/StoreContext";

const Footer = () => {
  const { store } = useStore();
  return <div className={styles.footerContainer}>{store.name}</div>;
};

export default Footer;
