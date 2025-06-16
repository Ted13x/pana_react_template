import React from "react";
import styles from "./Addresses.module.scss";

const Addresses = () => {
  return (
    <div className={styles.addressesContainer}>
      <h2>Address Book</h2>
      <p>You haven't added any addresses yet.</p>
      <button className={styles.addAddressButton}>Add New Address</button>
    </div>
  );
};

export default Addresses;
