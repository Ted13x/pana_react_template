import { useContext } from 'react';
import { PanaCustomerContext } from '../context/PanaCustomerContext';
import type { Customer } from '../context/PanaCustomerContext';

interface UsePanaAuthReturn {
  isAuthenticated: boolean;
  customer: Customer | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    customPropertyValues: []
  ) => Promise<boolean>;

  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  changeEmail: (newEmail: string) => Promise<boolean>;
}

export const usePanaAuth = (): UsePanaAuthReturn => {
  const {
    isAuthenticated,
    customer,
    loading,
    error,
    login,
    logout,
    register,
    changePassword,
    changeEmail,
  } = useContext(PanaCustomerContext);

  return {
    isAuthenticated,
    customer,
    loading,
    error,
    login,
    logout,
    register,
    changePassword,
    changeEmail,
  };
};

export default usePanaAuth;
