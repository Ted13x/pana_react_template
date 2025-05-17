import { useState, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { ConfigContext } from '../context/ConfigContext';

interface Address {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  email?: string;
  phone?: string;
}

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal' | 'bank_transfer' | 'invoice' | string;
  name: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDeliveryDays: number;
}

interface CheckoutState {
  billingAddress: Address | null;
  shippingAddress: Address | null;
  useShippingAsBilling: boolean;
  paymentMethod: PaymentMethod | null;
  shippingMethod: ShippingMethod | null;
  notes: string;
  step: 'address' | 'delivery' | 'payment' | 'review';
  availablePaymentMethods: PaymentMethod[];
  availableShippingMethods: ShippingMethod[];
  loading: boolean;
  error: string | null;
}

export const useCheckout = () => {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const { isAuthenticated, user, token } = useContext(AuthContext);
  const { apiKey, shopId } = useContext(ConfigContext);

  const [state, setState] = useState<CheckoutState>({
    billingAddress: null,
    shippingAddress: null,
    useShippingAsBilling: true,
    paymentMethod: null,
    shippingMethod: null,
    notes: '',
    step: 'address',
    availablePaymentMethods: [
      { id: 'credit_card', type: 'credit_card', name: 'Credit Card' },
      { id: 'paypal', type: 'paypal', name: 'PayPal' },
      { id: 'bank_transfer', type: 'bank_transfer', name: 'Bank Transfer' },
    ],
    availableShippingMethods: [
      {
        id: 'standard',
        name: 'Standard Shipping',
        price: 4.99,
        estimatedDeliveryDays: 5,
      },
      {
        id: 'express',
        name: 'Express Shipping',
        price: 9.99,
        estimatedDeliveryDays: 2,
      },
    ],
    loading: false,
    error: null,
  });

  const setShippingAddress = (address: Address) => {
    setState(prev => ({
      ...prev,
      shippingAddress: address,
      billingAddress: prev.useShippingAsBilling ? address : prev.billingAddress,
    }));
  };

  const setBillingAddress = (address: Address) => {
    setState(prev => ({
      ...prev,
      billingAddress: address,
    }));
  };

  const toggleUseShippingAsBilling = (value: boolean) => {
    setState(prev => ({
      ...prev,
      useShippingAsBilling: value,
      billingAddress: value ? prev.shippingAddress : prev.billingAddress,
    }));
  };

  const setPaymentMethod = (methodId: string) => {
    const method = state.availablePaymentMethods.find(m => m.id === methodId);
    if (method) {
      setState(prev => ({
        ...prev,
        paymentMethod: method,
      }));
    }
  };

  const setShippingMethod = (methodId: string) => {
    const method = state.availableShippingMethods.find(m => m.id === methodId);
    if (method) {
      setState(prev => ({
        ...prev,
        shippingMethod: method,
      }));
    }
  };

  const setOrderNotes = (notes: string) => {
    setState(prev => ({
      ...prev,
      notes,
    }));
  };

  const nextStep = () => {
    setState(prev => {
      switch (prev.step) {
        case 'address':
          return { ...prev, step: 'delivery' };
        case 'delivery':
          return { ...prev, step: 'payment' };
        case 'payment':
          return { ...prev, step: 'review' };
        default:
          return prev;
      }
    });
  };

  const prevStep = () => {
    setState(prev => {
      switch (prev.step) {
        case 'delivery':
          return { ...prev, step: 'address' };
        case 'payment':
          return { ...prev, step: 'delivery' };
        case 'review':
          return { ...prev, step: 'payment' };
        default:
          return prev;
      }
    });
  };

  const calculateTotal = () => {
    let total = cartTotal;
    if (state.shippingMethod) {
      total += state.shippingMethod.price;
    }
    return total;
  };

  const placeOrder = async (): Promise<{
    success: boolean;
    orderId?: string;
    error?: string;
  }> => {
    if (
      !state.shippingAddress ||
      !state.billingAddress ||
      !state.paymentMethod ||
      !state.shippingMethod
    ) {
      return {
        success: false,
        error: 'Bitte fülle alle erforderlichen Felder aus.',
      };
    }

    if (cartItems.length === 0) {
      return {
        success: false,
        error: 'Dein Warenkorb ist leer.',
      };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // In einer echten Implementierung würde hier die API aufgerufen werden
      // Beispiel:
      // const response = await orderService.createOrder({
      //   items: cartItems,
      //   shippingAddress: state.shippingAddress,
      //   billingAddress: state.billingAddress,
      //   paymentMethod: state.paymentMethod.id,
      //   shippingMethod: state.shippingMethod.id,
      //   notes: state.notes,
      // }, token, apiKey, shopId);

      // Simuliere eine API-Antwort
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generiere eine zufällige Bestellnummer
      const orderId = `ORDER-${Math.floor(Math.random() * 1000000)}`;

      clearCart();

      setState(prev => ({ ...prev, loading: false }));

      return {
        success: true,
        orderId,
      };
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten.',
      }));

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten.',
      };
    }
  };

  return {
    ...state,
    cartItems,
    cartTotal,
    totalWithShipping: calculateTotal(),
    setShippingAddress,
    setBillingAddress,
    toggleUseShippingAsBilling,
    setPaymentMethod,
    setShippingMethod,
    setOrderNotes,
    nextStep,
    prevStep,
    placeOrder,
  };
};
