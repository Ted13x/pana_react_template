import React, { useState } from 'react';
import styles from './ProductCarousel.module.scss';

interface ProductCarouselProps {
  images: string[];
  productName: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ images, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Füge das 3D-Modell als erstes Bild hinzu
  const allImages = ['/3d_mock/placeholder_glasses.glb', ...images];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const is3DModel = (url: string) => {
    return url.includes('.glb') || url.includes('.gltf');
  };

  return (
    <div className={styles.carousel}>
      <div className={styles.carouselContainer}>
        {/* 3D Model Viewer oder Bild */}
        {is3DModel(allImages[currentIndex]) ? (
          <div className={styles.model3dContainer}>
            <model-viewer
              src={allImages[currentIndex]}
              alt={`3D Model von ${productName}`}
              camera-controls
              auto-rotate
              shadow-intensity="1"
              environment-image="neutral"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        ) : (
          <img
            src={allImages[currentIndex]}
            alt={`${productName} - Bild ${currentIndex + 1}`}
            className={styles.carouselImage}
          />
        )}
        
        {/* Navigation Buttons */}
        <button 
          className={`${styles.carouselButton} ${styles.prevButton}`}
          onClick={prevSlide}
          aria-label="Vorheriges Bild"
        >
          ‹
        </button>
        <button 
          className={`${styles.carouselButton} ${styles.nextButton}`}
          onClick={nextSlide}
          aria-label="Nächstes Bild"
        >
          ›
        </button>
      </div>

      {/* Dots Navigation */}
      <div className={styles.dotsContainer}>
        {allImages.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Gehe zu Bild ${index + 1}`}
          />
        ))}
      </div>


    </div>
  );
};

export default ProductCarousel; 