import { create } from 'zustand';

export const CURRENCY_STORAGE_KEY = 'openroof.currency';
export const DEFAULT_CURRENCY = 'PYG';
export const SUPPORTED_CURRENCIES = ['PYG', 'USD', 'BRL'];

function normalizeCurrency(currency) {
  if (!currency) return null;

  const normalized = String(currency).trim().toUpperCase();
  return SUPPORTED_CURRENCIES.includes(normalized) ? normalized : null;
}

function readStoredCurrency(storage = globalThis?.localStorage) {
  if (!storage) return DEFAULT_CURRENCY;
  return normalizeCurrency(storage.getItem(CURRENCY_STORAGE_KEY)) ?? DEFAULT_CURRENCY;
}

function writeStoredCurrency(currency, storage = globalThis?.localStorage) {
  if (!storage) return DEFAULT_CURRENCY;

  const normalized = normalizeCurrency(currency) ?? DEFAULT_CURRENCY;
  storage.setItem(CURRENCY_STORAGE_KEY, normalized);
  return normalized;
}

const useCurrencyStore = create((set, get) => ({
  selectedCurrency: readStoredCurrency(),
  setCurrency: (currency) => {
    const normalized = writeStoredCurrency(currency);
    set({ selectedCurrency: normalized });
    return normalized;
  },
  isForeignCurrency: () => get().selectedCurrency !== 'PYG',
}));

export { normalizeCurrency, readStoredCurrency, writeStoredCurrency };
export default useCurrencyStore;
