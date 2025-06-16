import React from "react";
import styles from "./Orders.module.scss";

const Orders = () => {
  return (
    <div className={styles.ordersContainer}>
      <h2>My Orders</h2>
      <p>You haven't placed any orders yet.</p>
    </div>
  );
};

export default Orders;
