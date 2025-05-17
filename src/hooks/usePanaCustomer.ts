// src/hooks/usePanaCustomer.ts
import { useContext } from 'react';
import { PanaCustomerContext, PanaCustomerContextType } from '../context/PanaCustomerContext';
import type { Customer, Address, Order } from '../context/PanaCustomerContext';

interface UsePanaCustomerReturn {
  // Customer data
  customer: Customer | null;
  loading: boolean;
  error: string | null;
  refreshCustomer: () => Promise<void>;

  // Addresses
  addresses: Address[] | null;
  addressesLoading: boolean;
  addressesError: string | null;
  refreshAddresses: () => Promise<void>;
  createAddress: (addressData: Partial<Address>) => Promise<Address | null>;
  updateAddress: (addressId: number, addressData: Partial<Address>) => Promise<Address | null>;
  deleteAddress: (addressId: number) => Promise<boolean>;
  setDefaultAddress: (addressId: number) => Promise<boolean>;

  // Orders
  orders: Order[] | null;
  ordersLoading: boolean;
  ordersError: string | null;
  refreshOrders: () => Promise<void>;
  getOrder: (orderId: number) => Promise<Order | null>;
  createOrder: (orderData: { comment?: string; addressId: number }) => Promise<Order | null>;

  // Authentication status
  isAuthenticated: boolean;
}

export const usePanaCustomer = (): UsePanaCustomerReturn => {
  const {
    customer,
    loading,
    error,
    refreshCustomer,

    addresses,
    addressesLoading,
    addressesError,
    refreshAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,

    orders,
    ordersLoading,
    ordersError,
    refreshOrders,
    getOrder,
    createOrder,

    isAuthenticated,
  } = useContext(PanaCustomerContext);

  return {
    customer,
    loading,
    error,
    refreshCustomer,
    addresses,
    addressesLoading,
    addressesError,
    refreshAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    orders,
    ordersLoading,
    ordersError,
    refreshOrders,
    getOrder,
    createOrder,
    isAuthenticated,
  };
};

export default usePanaCustomer;
