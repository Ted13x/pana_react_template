import React from "react";
import styles from "./Sidebar.module.scss";

type ActiveTab = "orders" | "returns" | "account-data" | "addresses";

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  return (
    <div className={styles.sidebarContainer}>
      <ul className={styles.sidebarMenu}>
        <li
          className={`${styles.menuItem} ${
            activeTab === "orders" ? styles.active : ""
          }`}
          onClick={() => onTabChange("orders")}
        >
          My orders
        </li>
        <li
          className={`${styles.menuItem} ${
            activeTab === "returns" ? styles.active : ""
          }`}
          onClick={() => onTabChange("returns")}
        >
          My returns
        </li>
        <li
          className={`${styles.menuItem} ${
            activeTab === "account-data" ? styles.active : ""
          }`}
          onClick={() => onTabChange("account-data")}
        >
          Account data
        </li>
        <li
          className={`${styles.menuItem} ${
            activeTab === "addresses" ? styles.active : ""
          }`}
          onClick={() => onTabChange("addresses")}
        >
          Address book
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
