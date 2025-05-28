// src/components/products/ProductList.tsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { usePanaProducts } from "../../hooks/usePanaProducts";
import { usePanaCart } from "../../hooks/usePanaCart";
import { usePanaAuth } from "../../hooks/usePanaAuth";
import styles from "./ProductList.module.scss";

const ProductList = () => {
  const navigate = useNavigate();
  const {
    products,
    productsLoading,
    productsError,
    fetchProducts,
    searchTerm,
    setSearchTerm,
  } = usePanaProducts();
  const { addToCart, loading: cartLoading } = usePanaCart();
  const { isAuthenticated } = usePanaAuth();
  const [isGridView, setIsGridView] = useState(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  // Status für die ausgewählten Varianten und Bildindizes pro Produkt
  const [selectedVariants, setSelectedVariants] = useState<{
    [key: number]: number;
  }>({});
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    // Produkte beim ersten Laden abrufen, falls sie noch nicht geladen wurden
    if (products.length === 0 && !productsLoading) {
      fetchProducts();
    }
  }, []);

  // Initialisierung der ausgewählten Varianten nach dem Laden der Produkte
  useEffect(() => {
    if (products.length > 0) {
      const initialSelectedVariants: { [key: number]: number } = {};

      products.forEach((product) => {
        if (product.variants && product.variants.length > 0) {
          // Finde die default Variante oder nutze die erste
          const defaultVariantIndex = product.variants.findIndex(
            (v) => v.defaultVariant
          );
          initialSelectedVariants[product.id] =
            defaultVariantIndex !== -1 ? defaultVariantIndex : 0;
        }
      });

      setSelectedVariants(initialSelectedVariants);
    }
  }, [products]);

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const handleVariantChange = (productId: number, variantIndex: number) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variantIndex,
    }));

    // Setze den Bildindex zurück, wenn die Variante wechselt
    const variantKey = `${productId}-${variantIndex}`;
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [variantKey]: 0,
    }));
  };

  const handleAddToCart = async (
    e: React.MouseEvent,
    productId: number,
    variantId: number
  ) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      // Wenn nicht eingeloggt, zum Login weiterleiten
      navigate("/login", {
        state: {
          redirect: "/",
          message:
            "Bitte melden Sie sich an, um Artikel zum Warenkorb hinzuzufügen.",
        },
      });
      return;
    }

    setAddingToCart(variantId);

    try {
      const success = await addToCart(variantId, 1);
      if (success) {
        console.log(
          `Variante ${variantId} erfolgreich zum Warenkorb hinzugefügt`
        );

        // Erfolgsmeldung anzeigen (optional - könnte durch Toast-Notification ersetzt werden)
        // Hier könnten Sie eine Benachrichtigung anzeigen
      } else {
        console.error(
          `Fehler beim Hinzufügen der Variante ${variantId} zum Warenkorb`
        );
        alert(
          "Fehler beim Hinzufügen zum Warenkorb. Bitte versuchen Sie es erneut."
        );
      }
    } catch (error) {
      console.error("Fehler beim Hinzufügen zum Warenkorb:", error);
      alert(
        "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
      );
    } finally {
      setAddingToCart(null);
    }
  };

  const navigateImage = (
    productId: number,
    variantIndex: number,
    direction: "prev" | "next"
  ) => {
    const variantKey = `${productId}-${variantIndex}`;
    const variant = products.find((p) => p.id === productId)?.variants?.[
      variantIndex
    ];

    if (!variant || !variant.medias || variant.medias.length <= 1) return;

    const currentIndex = currentImageIndexes[variantKey] || 0;
    const totalImages = variant.medias.length;

    let newIndex;
    if (direction === "next") {
      newIndex = (currentIndex + 1) % totalImages;
    } else {
      newIndex = (currentIndex - 1 + totalImages) % totalImages;
    }

    setCurrentImageIndexes((prev) => ({
      ...prev,
      [variantKey]: newIndex,
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts({ searchKey: searchTerm });
  };

  const toggleView = () => {
    setIsGridView(!isGridView);
  };

  // Placeholder-Bild-URL für Produkte ohne Bilder
  const placeholderImage = "https://via.placeholder.com/200x200?text=Kein+Bild";

  if (productsLoading) {
    return <div className={styles.loading}>Produkte werden geladen...</div>;
  }

  if (productsError) {
    return (
      <div className={styles.error}>
        Fehler beim Laden der Produkte: {productsError}
      </div>
    );
  }

  if (products.length === 0) {
    return <div className={styles.empty}>Keine Produkte gefunden.</div>;
  }

  return (
    <div className={styles.productListContainer}>
      <div className={styles.productHeader}>
        <h1 className={styles.productTitle}>Unsere Produkte</h1>

        <div className={styles.productControls}>
          <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Produkte suchen..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              Suchen
            </button>
          </form>

          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${
                isGridView ? styles.active : ""
              }`}
              onClick={toggleView}
              aria-label="Grid ansicht"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button
              className={`${styles.viewButton} ${
                !isGridView ? styles.active : ""
              }`}
              onClick={toggleView}
              aria-label="Listen ansicht"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`${styles.productGrid} ${
          !isGridView ? styles.listView : ""
        }`}
      >
        {products.map((product) => {
          if (!product.variants || product.variants.length === 0) {
            return (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.emptyProduct}>
                  <p>Keine Produktvarianten verfügbar</p>
                </div>
              </div>
            );
          }

          const selectedVariantIndex = selectedVariants[product.id] || 0;
          const selectedVariant = product.variants[selectedVariantIndex];
          const variantKey = `${product.id}-${selectedVariantIndex}`;
          const currentImageIndex = currentImageIndexes[variantKey] || 0;
          const hasMultipleImages =
            selectedVariant.medias && selectedVariant.medias.length > 1;

          return (
            <div
              key={product.id}
              className={styles.productCard}
              onClick={() => handleProductClick(product.id)}
            >
              {product.brand && (
                <div className={styles.productBrand}>{product.brand}</div>
              )}

              <div className={styles.variantImageContainer}>
                {hasMultipleImages && (
                  <button
                    className={`${styles.imageNavButton} ${styles.prevButton}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateImage(product.id, selectedVariantIndex, "prev");
                    }}
                    aria-label="Vorheriges Bild"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                )}

                <img
                  src={
                    selectedVariant.medias && selectedVariant.medias.length > 0
                      ? selectedVariant.medias[currentImageIndex].url
                      : placeholderImage
                  }
                  alt={selectedVariant.name || "Produktvariante"}
                  className={styles.variantImage}
                />

                {hasMultipleImages && (
                  <button
                    className={`${styles.imageNavButton} ${styles.nextButton}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateImage(product.id, selectedVariantIndex, "next");
                    }}
                    aria-label="Nächstes Bild"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                )}

                {hasMultipleImages && (
                  <div className={styles.imageDots}>
                    {selectedVariant?.medias?.map((_, index) => (
                      <span
                        key={index}
                        className={`${styles.imageDot} ${
                          index === currentImageIndex ? styles.active : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndexes((prev) => ({
                            ...prev,
                            [variantKey]: index,
                          }));
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.variantDetails}>
                <h3 className={styles.variantName}>{selectedVariant.name}</h3>

                {product.variants.length > 1 && (
                  <div className={styles.variantSelector}>
                    <select
                      value={selectedVariantIndex}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleVariantChange(
                          product.id,
                          parseInt(e.target.value)
                        );
                      }}
                      className={styles.variantSelect}
                    >
                      {product.variants.map((variant, index) => (
                        <option key={variant.id} value={index}>
                          {variant.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedVariant.prices &&
                  selectedVariant.prices.length > 0 && (
                    <p className={styles.variantPrice}>
                      {parseFloat(
                        selectedVariant.prices[0].value.toString()
                      ).toLocaleString("de-DE", {
                        style: "currency",
                        currency: selectedVariant.prices[0].currency,
                      })}
                    </p>
                  )}
              </div>

              <div className={styles.productActions}>
                <button
                  className={styles.addToCartButton}
                  onClick={(e) =>
                    handleAddToCart(e, product.id, selectedVariant.id)
                  }
                  disabled={addingToCart === selectedVariant.id || cartLoading}
                >
                  {addingToCart === selectedVariant.id
                    ? "Wird hinzugefügt..."
                    : "In den Warenkorb"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductList;
