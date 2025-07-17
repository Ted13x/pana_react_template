// src/components/ProductList/ProductList.tsx

import React, { useState } from "react";
import { useStore } from "../../contexts/StoreContext";
import { useCustomer } from "../../contexts/CustomerContext";
import { useCart } from "../../contexts/CartContext";
import { addShoppingCartItem } from "../../services/customer";
import { Product } from "../../panaTypes";
import styles from "./ProductList.module.scss";
import ProductCarousel from "./ProductCarousel";

const ProductList = () => {
  const { products } = useStore();
  const { isAuthenticated } = useCustomer();
  const { updateItemCount } = useCart();
  const [selectedVariants, setSelectedVariants] = useState<{ [productId: number]: number }>({});

  const handleAddToCart = async (productVariantId: number) => {
    if (!isAuthenticated) {
      alert("Bitte melden Sie sich an, um Produkte zum Warenkorb hinzuzufügen.");
      return;
    }

    try {
      console.debug('productVariantId: ', productVariantId)
      await addShoppingCartItem(productVariantId, 1);
      alert("Produkt wurde zum Warenkorb hinzugefügt!");
      // Aktualisiere die Warenkorb-Anzahl (temporär um 1 erhöhen)
      // In einer echten Implementierung würden Sie hier den aktuellen Warenkorb abrufen
      updateItemCount(1); // Dies ist ein Platzhalter - in der Praxis würden Sie die tatsächliche Anzahl abrufen
    } catch (error) {
      console.error("Fehler beim Hinzufügen zum Warenkorb:", error);
      alert("Fehler beim Hinzufügen zum Warenkorb. Bitte versuchen Sie es erneut.");
    }
  };

  const handleVariantChange = (productId: number, variantIndex: number) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: variantIndex
    }));
  };

  const getSelectedVariant = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return null;
    
    const selectedIndex = selectedVariants[product.id] || 0;
    return product.variants[selectedIndex];
  };

  return (
    <div className={styles.productList}>
{/*       <h2 className={styles.title}>Products ({products.length})</h2>
 */}      <div className={styles.grid}>
        {products.map((product: Product) => {
          const selectedVariant = getSelectedVariant(product);
          
          if (!selectedVariant) return null;

          return (
            <>
            <div key={product.id} className={styles.card}>
              {selectedVariant.medias && selectedVariant.medias.length > 0 && (
                <div className={styles.imageContainer}>
                  <img
                    src={selectedVariant.medias[0].url}
                    alt={selectedVariant.name || "Product image"}
                    className={styles.image}
                  />
                </div>
              )}
              
              <div className={styles.content}>
                <h3 className={styles.name}>
                  {selectedVariant.name || "Unnamed Product"}
                </h3>
                
               {/*  {product.brand && (
                  <p className={styles.brand}>{product.brand}</p>
                )} */}
                
               {/*  {product.category && (
                  <p className={styles.category}>{product.category.name}</p>
                )} */}
                
                {selectedVariant.description && (
                  <p className={styles.description}>
                    {selectedVariant.description}
                  </p>
                )}
                
                {selectedVariant.prices && selectedVariant.prices.length > 0 && (
                  <p className={styles.price}>
                    {selectedVariant.prices[0].value}{" "}
                    {/* {selectedVariant.prices[0].currency} */}
                  </p>
                )}

                {/* Variant Selector */}
                {product.variants && product.variants.length > 1 && (
                  <div className={styles.variantSelector}>
                    <label className={styles.variantLabel}>Variante auswählen:</label>
                    <select
                      value={selectedVariants[product.id] || 0}
                      onChange={(e) => handleVariantChange(product.id, parseInt(e.target.value))}
                      className={styles.variantSelect}
                    >
                      {product.variants.map((variant, index) => (
                        <option key={variant.id} value={index}>
                          {variant.name || `Variante ${index + 1}`}
                          {variant.prices && variant.prices.length > 0 && 
                            ` - ${variant.prices[0].value} ${variant.prices[0].currency}`
                          }
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <button 
                className={styles.addToCart}
                onClick={() => handleAddToCart(selectedVariant.id)}
              >
                Add to Cart
              </button>
            </div>
            {/* Zweite Karte mit Carousel */}
            <div key={`${product.id}-carousel`} className={styles.card}>
              <div className={styles.imageContainer}>
                <ProductCarousel
                  images={selectedVariant.medias ? selectedVariant.medias.map(media => media.url) : []}
                  productName={selectedVariant.name || "Unnamed Product"}
                />
              </div>
              <div className={styles.content}>
                <h3 className={styles.name}>
                  {selectedVariant.name || "Unnamed Product"}
                </h3>
                {selectedVariant.description && (
                  <p className={styles.description}>
                    {selectedVariant.description}
                  </p>
                )}
                {selectedVariant.prices && selectedVariant.prices.length > 0 && (
                  <p className={styles.price}>
                    {selectedVariant.prices[0].value}{" "}
                  </p>
                )}
                {product.variants && product.variants.length > 1 && (
                  <div className={styles.variantSelector}>
                    <label className={styles.variantLabel}>Variante auswählen:</label>
                    <select
                      value={selectedVariants[product.id] || 0}
                      onChange={(e) => handleVariantChange(product.id, parseInt(e.target.value))}
                      className={styles.variantSelect}
                    >
                      {product.variants.map((variant, index) => (
                        <option key={variant.id} value={index}>
                          {variant.name || `Variante ${index + 1}`}
                          {variant.prices && variant.prices.length > 0 && 
                            ` - ${variant.prices[0].value} ${variant.prices[0].currency}`
                          }
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <button 
                className={styles.addToCart}
                onClick={() => handleAddToCart(selectedVariant.id)}
              >
                Add to Cart
              </button>
            </div>
            </>
          );
        })}
      </div>
    </div>
  );
};

export default ProductList;
