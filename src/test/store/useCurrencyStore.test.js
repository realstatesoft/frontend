import { beforeEach, describe, expect, it } from 'vitest';
import useCurrencyStore, {
  CURRENCY_STORAGE_KEY,
  DEFAULT_CURRENCY,
  readStoredCurrency,
  writeStoredCurrency,
} from '../../store/useCurrencyStore';

describe('useCurrencyStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useCurrencyStore.setState({ selectedCurrency: DEFAULT_CURRENCY });
  });

  it('starts with the default currency', () => {
    expect(useCurrencyStore.getState().selectedCurrency).toBe(DEFAULT_CURRENCY);
    expect(useCurrencyStore.getState().isForeignCurrency()).toBe(false);
  });

  it('persists the selected currency in localStorage', () => {
    useCurrencyStore.getState().setCurrency('usd');

    expect(useCurrencyStore.getState().selectedCurrency).toBe('USD');
    expect(useCurrencyStore.getState().isForeignCurrency()).toBe(true);
    expect(localStorage.getItem(CURRENCY_STORAGE_KEY)).toBe('USD');
  });

  it('normalizes stored values and falls back to PYG when needed', () => {
    localStorage.setItem(CURRENCY_STORAGE_KEY, 'brl');

    expect(readStoredCurrency()).toBe('BRL');
    expect(writeStoredCurrency('invalid-value')).toBe(DEFAULT_CURRENCY);
  });
});
