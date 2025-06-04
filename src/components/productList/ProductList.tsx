// src/components/ProductList/ProductList.tsx

import React from "react";
import { useStore } from "../../contexts/StoreContext";
import { Product } from "../../panaTypes";
import styles from "./ProductList.module.scss";

const ProductList = () => {
  const { products } = useStore();

  return (
    <div className={styles.productList}>
      <h2 className={styles.title}>Products ({products.length})</h2>
      <div className={styles.grid}>
        {products.map((product: Product) => (
          <div key={product.id} className={styles.card}>
            {product.variants && product.variants.length > 0 && (
              <>
                {product.variants[0].medias &&
                  product.variants[0].medias.length > 0 && (
                    <div className={styles.imageContainer}>
                      <img
                        src={product.variants[0].medias[0].url}
                        alt={product.variants[0].name || "Product image"}
                        className={styles.image}
                      />
                    </div>
                  )}
                <div className={styles.content}>
                  <h3 className={styles.name}>
                    {product.variants[0].name || "Unnamed Product"}
                  </h3>
                  {product.brand && (
                    <p className={styles.brand}>{product.brand}</p>
                  )}
                  {product.category && (
                    <p className={styles.category}>{product.category.name}</p>
                  )}
                  {product.variants[0].description && (
                    <p className={styles.description}>
                      {product.variants[0].description}
                    </p>
                  )}
                  {product.variants[0].prices &&
                    product.variants[0].prices.length > 0 && (
                      <p className={styles.price}>
                        {product.variants[0].prices[0].value}{" "}
                        {product.variants[0].prices[0].currency}
                      </p>
                    )}
                </div>
                <button className={styles.addToCart}>Add to Cart</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
