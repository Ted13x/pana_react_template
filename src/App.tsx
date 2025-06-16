import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StoreProvider } from "./contexts/StoreContext";
import { CustomerProvider } from "./contexts/CustomerContext";
import Header from "./components/header/Header";
import ProductList from "./components/productList/ProductList";
import ErrorBoundary from "./components/error/ErrorBoundary";
import Footer from "./components/footer/Footer";
import Customer from "./components/customer/Customer";
import Cart from "./components/cart/Cart";

const LoadingFallback = () => <div>Loading...</div>;

function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <CustomerProvider>
        <Suspense fallback={<LoadingFallback />}>
          <BrowserRouter>
            <StoreProvider>
              <div className="app">
                <Header />
                <main>
                  <div className="container">
                    <Routes>
                      <Route path="/" element={<ProductList />} />
                      <Route path="/account" element={<Customer />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </div>
                </main>
                <Footer />
              </div>
            </StoreProvider>
          </BrowserRouter>
        </Suspense>
      </CustomerProvider>
    </ErrorBoundary>
  );
}

export default App;
