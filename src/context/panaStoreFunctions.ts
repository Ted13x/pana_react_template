// src/context/panaStoreFunctions.ts
import { PanaStoreClient } from '@pana-commerce/pana-sdk';
import type { components } from '@pana-commerce/pana-sdk/dist/public-api';
import { ProductsQueryParams } from './PanaStoreContext';

export type Store = components['schemas']['Store'];
export type Product = components['schemas']['StoreProduct'];

/**
 * Ruft Store-Daten vom Server ab
 * @param storeClient - Der initialisierte PanaStoreClient
 * @returns Die Store-Daten oder null im Fehlerfall
 */
export const fetchStoreData = async (storeClient: PanaStoreClient): Promise<Store | null> => {
  console.log('Calling storeClient.getStore()');

  try {
    const storeData = await storeClient.getStore();

    if (storeData) {
      console.log('Store data received successfully:', {
        id: storeData.id,
        name: storeData.name,
        dataProperties: Object.keys(storeData),
      });
      return storeData;
    } else {
      console.error('No store data available');
      throw new Error('No store data available');
    }
  } catch (error) {
    console.error('Error in fetchStoreData:', error);
    throw error;
  }
};

/**
 * Ruft Produktdaten vom Server ab
 * @param storeClient - Der initialisierte PanaStoreClient
 * @param params - Abfrageparameter für die Produktliste
 * @param defaultLimit - Standard-Limit für die Anzahl der Produkte
 * @returns Produktdaten inkl. Paginierungsinformationen
 */

export const fetchProducts = async (
  storeClient: PanaStoreClient,
  params: ProductsQueryParams = {},
  defaultLimit: number = 10
) => {
  console.log('Starting to fetch products with params:', params);

  try {
    const productsData = await storeClient.getAllProducts(params);
    console.log('Raw products response:', JSON.stringify(productsData, null, 2));

    // Anpassung an die tatsächliche API-Antwortstruktur
    if (productsData && productsData.data) {
      // Hier ist die Änderung: productsData.data ist bereits das Array von Produkten
      const items = productsData.data;
      const meta = productsData.meta || {};

      console.log('Products data structure:', {
        itemsArray: Array.isArray(items),
        itemsLength: items?.length || 0,
        firstItem: items && items.length > 0 ? items[0].id : 'no items',
      });

      return {
        products: items as Product[],
        totalProducts: meta.total || 0,
        currentPage: meta.currentPage || 1,
        totalPages: meta.lastPage || Math.ceil((meta.total || 0) / (params.limit || defaultLimit)),
      };
    } else {
      console.error('No products data available');
      throw new Error('No products data available');
    }
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    throw error;
  }
};

/**
 * Ruft ein einzelnes Produkt vom Server ab
 * @param storeClient - Der initialisierte PanaStoreClient
 * @param productId - Die ID des abzurufenden Produkts
 * @returns Das Produkt oder null im Fehlerfall
 */
export const getProduct = async (
  storeClient: PanaStoreClient,
  productId: number
): Promise<Product | null> => {
  console.log(`Starting to fetch product with ID: ${productId}`);

  try {
    const productData = await storeClient.getProduct(productId);

    console.log('Product data received:', productData ? 'success' : 'not found');
    return productData as Product;
  } catch (error) {
    console.error(`Error in getProduct with ID ${productId}:`, error);
    throw error;
  }
};
