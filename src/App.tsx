import React, { Suspense } from "react";
import { StoreProvider } from "./contexts/StoreContext";
import { CustomerProvider } from "./contexts/CustomerContext";
import Header from "./components/header/Header";
import ProductList from "./components/productList/ProductList";
import ErrorBoundary from "./components/error/ErrorBoundary";
import Footer from "./components/footer/Footer";

const LoadingFallback = () => <div>Loading...</div>;

function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <CustomerProvider>
        <Suspense fallback={<LoadingFallback />}>
          <StoreProvider>
            <div className="app">
              <Header />
              <main>
                <div className="container">
                  <ProductList />
                </div>
              </main>
              <Footer />
            </div>
          </StoreProvider>
        </Suspense>
      </CustomerProvider>
    </ErrorBoundary>
  );
}

export default App;
