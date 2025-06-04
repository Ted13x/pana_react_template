import React from "react";
import styles from "./Customer.module.scss";
import Sidebar from "./atoms/Sidebar";

const Customer = () => {
  return (
    <div className={styles.customerContainer}>
      <Sidebar />
    </div>
  );
};

export default Customer;
