import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePanaProduct } from "../../hooks/usePanaProduct";
import { usePanaCart } from "../../hooks/usePanaCart";
import { usePanaAuth } from "../../hooks/usePanaAuth";
import styles from "./ProductDetails.module.scss";

const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const { product, loading, error, fetchProduct } = usePanaProduct({
    productId: Number(productId),
    autoLoad: true,
  });

  const { addToCart, loading: cartLoading } = usePanaCart();
  const { isAuthenticated } = usePanaAuth();

  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      const defaultVariantIndex = product.variants.findIndex(
        (v) => v.defaultVariant
      );
      setSelectedVariantIndex(
        defaultVariantIndex !== -1 ? defaultVariantIndex : 0
      );
      setCurrentImageIndex(0);
    }
  }, [product]);

  const navigateImage = (direction: "prev" | "next") => {
    if (
      !product ||
      !product.variants ||
      !product.variants[selectedVariantIndex]
    )
      return;

    const variant = product.variants[selectedVariantIndex];
    if (!variant.medias || variant.medias.length <= 1) return;

    const totalImages = variant.medias.length;

    if (direction === "next") {
      setCurrentImageIndex((currentImageIndex + 1) % totalImages);
    } else {
      setCurrentImageIndex((currentImageIndex - 1 + totalImages) % totalImages);
    }
  };

  const handleVariantChange = (index: number) => {
    setSelectedVariantIndex(index);
    setCurrentImageIndex(0);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (
      !product ||
      !product.variants ||
      !product.variants[selectedVariantIndex]
    )
      return;

    const variant = product.variants[selectedVariantIndex];

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          redirect: `/product/${productId}`,
          message:
            "Bitte melden Sie sich an, um Artikel zum Warenkorb hinzuzufügen.",
        },
      });
      return;
    }

    setIsAddingToCart(true);

    try {
      const success = await addToCart(variant.id, quantity);
      if (success) {
        console.log(`${quantity}x ${variant.name} zum Warenkorb hinzugefügt`);

        // Erfolgsmeldung anzeigen (optional - könnte durch Toast-Notification ersetzt werden)
        // Hier könnten Sie eine Benachrichtigung anzeigen oder den Benutzer zum Warenkorb weiterleiten

        // Optional: Benutzer fragen ob er zum Warenkorb möchte
        const goToCart = window.confirm(
          `${variant.name} wurde erfolgreich hinzugefügt! Möchten Sie zum Warenkorb?`
        );
        if (goToCart) {
          navigate("/cart");
        }
      } else {
        console.error("Fehler beim Hinzufügen zum Warenkorb");
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
      setIsAddingToCart(false);
    }
  };

  const handleBackToProducts = () => {
    navigate("/");
  };

  if (loading) {
    return <div className={styles.loading}>Produkt wird geladen...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Fehler beim Laden des Produkts</h2>
        <p>{error}</p>
        <button className={styles.backButton} onClick={handleBackToProducts}>
          Zurück zu allen Produkten
        </button>
      </div>
    );
  }

  if (!product || !product.variants || product.variants.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>Produkt nicht gefunden</h2>
        <p>Das gesuchte Produkt ist nicht verfügbar oder existiert nicht.</p>
        <button className={styles.backButton} onClick={handleBackToProducts}>
          Zurück zu allen Produkten
        </button>
      </div>
    );
  }

  const selectedVariant = product.variants[selectedVariantIndex];
  const hasMultipleImages =
    selectedVariant.medias && selectedVariant.medias.length > 1;
  const price =
    selectedVariant.prices && selectedVariant.prices.length > 0
      ? parseFloat(selectedVariant.prices[0].value.toString()).toLocaleString(
          "de-DE",
          {
            style: "currency",
            currency: selectedVariant.prices[0].currency,
          }
        )
      : "Preis auf Anfrage";

  return (
    <div className={styles.productDetails}>
      <div className={styles.breadcrumbs}>
        <button className={styles.backLink} onClick={handleBackToProducts}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Zurück zu allen Produkten
        </button>
      </div>

      <div className={styles.productContainer}>
        {/* Linke Spalte - Bildgalerie */}
        <div className={styles.productGallery}>
          <div className={styles.mainImageContainer}>
            {hasMultipleImages && (
              <button
                className={`${styles.imageNavButton} ${styles.prevButton}`}
                onClick={() => navigateImage("prev")}
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
                  : "https://via.placeholder.com/600x600?text=Kein+Bild"
              }
              alt={selectedVariant.name || "Produktvariante"}
              className={styles.mainImage}
            />

            {hasMultipleImages && (
              <button
                className={`${styles.imageNavButton} ${styles.nextButton}`}
                onClick={() => navigateImage("next")}
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
          </div>

          {hasMultipleImages && (
            <div className={styles.thumbnailsContainer}>
              {selectedVariant?.medias?.map((media, index) => (
                <div
                  key={index}
                  className={`${styles.thumbnail} ${
                    index === currentImageIndex ? styles.active : ""
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img
                    src={media.url}
                    alt={`Thumbnail ${index + 1}`}
                    className={styles.thumbnailImage}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.productInfo}>
          {product.brand && (
            <div className={styles.productBrand}>{product.brand}</div>
          )}

          <h1 className={styles.productName}>{selectedVariant.name}</h1>

          <div className={styles.productPrice}>{price}</div>

          {product.variants.length > 1 && (
            <div className={styles.variantSelector}>
              <label htmlFor="variant-select">Variante:</label>
              <select
                id="variant-select"
                value={selectedVariantIndex}
                onChange={(e) => handleVariantChange(parseInt(e.target.value))}
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

          <div className={styles.quantityContainer}>
            <label htmlFor="quantity">Menge:</label>
            <div className={styles.quantityControls}>
              <button
                className={styles.quantityButton}
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className={styles.quantityInput}
              />
              <button
                className={styles.quantityButton}
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          <button
            className={styles.addToCartButton}
            onClick={handleAddToCart}
            disabled={isAddingToCart || cartLoading}
          >
            {isAddingToCart ? "Wird hinzugefügt..." : "In den Warenkorb"}
          </button>

          <div className={styles.productDescription}>
            <h2>Produktbeschreibung</h2>
            <div className={styles.descriptionContent}>
              {selectedVariant.description || (
                <p>Keine Beschreibung verfügbar</p>
              )}
            </div>
          </div>

          <div className={styles.productDetails}>
            <h2>Produktdetails</h2>
            <div className={styles.detailsContent}>{selectedVariant.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
