import { useState, useEffect, useContext } from 'react';
import { PanaStoreContext } from '../context/PanaStoreContext';
import type { Product } from '../context/PanaStoreContext';

interface UsePanaProductProps {
  productId: number;
  autoLoad?: boolean;
}

interface UsePanaProductReturn {
  // Product data
  product: Product | null;
  loading: boolean;
  error: string | null;

  // Product operations
  fetchProduct: () => Promise<void>;
}

export const usePanaProduct = ({
  productId,
  autoLoad = true,
}: UsePanaProductProps): UsePanaProductReturn => {
  const { getProduct } = useContext(PanaStoreContext);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async (): Promise<void> => {
    if (!productId) {
      setError('No product ID provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const productData = await getProduct(productId);

      if (productData) {
        setProduct(productData);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad && productId) {
      fetchProduct();
    }
  }, [productId, autoLoad]);

  return {
    product,
    loading,
    error,
    fetchProduct,
  };
};

export default usePanaProduct;
