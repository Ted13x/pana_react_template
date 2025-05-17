import React, { createContext, ReactNode } from 'react';

export interface ConfigContextType {
  apiKey: string;
  shopId: string;
  apiBaseUrl?: string;
  debug: boolean;
}

export const ConfigContext = createContext<ConfigContextType>({
  apiKey: '',
  shopId: '',
  apiBaseUrl: 'https://api.pana.app/v1',
  debug: false,
});

interface ConfigProviderProps {
  children: ReactNode;
  value: ConfigContextType;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children, value }) => {
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};
