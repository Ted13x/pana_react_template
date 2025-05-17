// src/hooks/useConfig.ts
import { useContext } from 'react';
import type { ConfigContextType } from '../context/ConfigContext';
import { ConfigContext } from '../context/ConfigContext';

export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);

  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }

  return context;
};

export default useConfig;
