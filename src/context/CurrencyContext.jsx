import React, { createContext, useContext, useState, useEffect } from "react";
import {
  DEFAULT_CURRENCY_CONFIG,
  wlToIdr as utilWlToIdr,
  idrToWl as utilIdrToWl,
  formatLocks as utilFormatLocks,
  formatIDR as utilFormatIDR,
  formatDual as utilFormatDual,
  calculateROI as utilCalculateROI,
  locksToTotalWl,
  totalWlToLocks
} from "../utils/currency";
import { loadCurrencyConfigFromStorage, saveCurrencyConfigToStorage } from "../utils/storage";

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [config, setConfig] = useState(loadCurrencyConfigFromStorage);

  useEffect(() => {
    saveCurrencyConfigToStorage(config);
  }, [config]);

  const updateConfig = (newConfig) => {
    setConfig((prev) => ({
      ...prev,
      ...newConfig
    }));
  };

  const wlToIdr = (wl) => utilWlToIdr(wl, config.idrPerDl);
  const idrToWl = (idr) => utilIdrToWl(idr, config.idrPerDl);
  const formatLocks = (wl, opts) => utilFormatLocks(wl, opts);
  const formatIDR = (amount) => utilFormatIDR(amount);
  const formatDual = (wl) => utilFormatDual(wl, config.idrPerDl);
  const calculateROI = (capital, profit) => utilCalculateROI(capital, profit);

  const value = {
    config,
    updateConfig,
    wlToIdr,
    idrToWl,
    formatLocks,
    formatIDR,
    formatDual,
    calculateROI,
    locksToTotalWl,
    totalWlToLocks
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
