import React from "react";
import styles from "./Sidebar.module.scss";

const Sidebar = () => {
  return (
    <div className={styles.sidebarContainer}>
      <ul>
        <li>My orders</li>
        <li>My returns</li>
        <li>Account data</li>
        <li>Addresses</li>
      </ul>
    </div>
  );
};

export default Sidebar;
