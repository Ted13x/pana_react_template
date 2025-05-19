import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import React from "react";

import { ConfigProvider } from "./context/ConfigContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { PanaStoreProvider } from "./context/PanaStoreContext";
import { PanaCustomerProvider } from "./context/PanaCustomerContext";

import Header from "./components/header/Header";
import Cart from "./components/cart/Cart";
import Checkout from "./components/checkout/Checkout";
import Login from "./components/login/Login";
import Registration from "./components/registration/Registration";
import Products from "./components/products/ProductList";
import Product from "./components/productDetails/ProductDetails";
import Order from "./components/order/Order";
import Favs from "./components/login/Favs";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("pana_auth_token");
    setIsAuthenticated(!!token);
  }, []);

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const [apiConfig] = useState({
    apiKey: import.meta.env.VITE_PANA_API_KEY || "",
    shopId: import.meta.env.VITE_PANA_SHOP_ID || "",
    apiBaseUrl:
      import.meta.env.VITE_PANA_API_BASE_URL || "https://api.pana.app/v1",
    debug: import.meta.env.MODE === "development",
  });

  const storeApiToken = import.meta.env.VITE_PANA_STORE_API_TOKEN || "";

  return (
    <ConfigProvider value={apiConfig}>
      <PanaStoreProvider
        config={{
          storeApiToken,
          shopId: apiConfig.shopId,
          apiBaseUrl: apiConfig.apiBaseUrl,
          debug: apiConfig.debug,
        }}
        initialProductsLimit={12}
      >
        <AuthProvider apiKey={apiConfig.apiKey} shopId={apiConfig.shopId}>
          <CartProvider>
            <PanaCustomerProvider
              storeApiToken={storeApiToken}
              debug={apiConfig.debug}
            >
              <Router>
                <div className="app-container">
                  <Header />
                  <main>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Products />} />
                      <Route path="/product/:productId" element={<Product />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Registration />} />

                      {/* Private routes */}
                      <Route
                        path="/checkout"
                        element={
                          <ProtectedRoute>
                            <Checkout />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/order/:orderId"
                        element={
                          <ProtectedRoute>
                            <Order />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/favorites"
                        element={
                          <ProtectedRoute>
                            <Favs />
                          </ProtectedRoute>
                        }
                      />

                      {/* Fallback for unknown routes */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </Router>
            </PanaCustomerProvider>
          </CartProvider>
        </AuthProvider>
      </PanaStoreProvider>
    </ConfigProvider>
  );
}

export default App;
