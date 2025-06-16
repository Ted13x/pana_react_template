// src/components/customer/Customer.tsx

import React, { useState } from "react";
import styles from "./Customer.module.scss";
import Sidebar from "./atoms/Sidebar";
import AccountData from "./atoms/AccountData";
import Orders from "./atoms/Orders";
import Returns from "./atoms/Returns";
import Addresses from "./atoms/Addresses";

type ActiveTab = "orders" | "returns" | "account-data" | "addresses";

const Customer = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("account-data");

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
  };

  return (
    <div className={styles.customerContainer}>
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className={styles.contentContainer}>
        {activeTab === "orders" && <Orders />}
        {activeTab === "returns" && <Returns />}
        {activeTab === "account-data" && <AccountData />}
        {activeTab === "addresses" && <Addresses />}
      </div>
    </div>
  );
};

export default Customer;
