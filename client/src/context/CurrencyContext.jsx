import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('digitalstore_currency') || 'INR';
  });

  const toggleCurrency = () => {
    setCurrency(prev => {
      const next = prev === 'INR' ? 'USD' : 'INR';
      localStorage.setItem('digitalstore_currency', next);
      return next;
    });
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, toggleCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
