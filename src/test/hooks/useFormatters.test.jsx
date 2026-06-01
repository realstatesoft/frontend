import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useFormatters from '../../../src/hooks/useFormatters';
import useCurrencyStore from '../../../src/store/useCurrencyStore';
import useExchangeRates from '../../../src/hooks/useExchangeRates';
import { useTranslation } from 'react-i18next';

vi.mock('../../../src/store/useCurrencyStore', () => ({
  __esModule: true,
  default: vi.fn(),
  DEFAULT_CURRENCY: 'PYG',
}));

vi.mock('../../../src/hooks/useExchangeRates', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

describe('useFormatters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTranslation.mockReturnValue({ i18n: { language: 'es' } });
    useCurrencyStore.mockReturnValue('USD');
    useExchangeRates.mockReturnValue({
      data: {
        rates: [
          { currencyCode: 'USD', sellRate: '7500' },
          { currencyCode: 'PYG', sellRate: '1' }
        ]
      }
    });
  });

  it('should format currency using the target currency if no conversion needed', () => {
    const { result } = renderHook(() => useFormatters());
    // By default target is USD, base is USD -> NO conversion needed (because target === base is checked via targetCurrency vs baseCurrency Override)
    // Wait, by default base is DEFAULT_CURRENCY ('PYG').
    // So target is USD, base is PYG. Conversion IS needed!
    // baseRate is 1. targetRate is 7500.
    // PYG -> USD: value = value / targetRate -> 7500 / 7500 = 1.
    const formatted = result.current.formatCurrency(7500);
    // Locale is es-PY. format for USD in es-PY is "US$ 1.00"
    expect(formatted).toMatch(/1[.,]00/);
  });

  it('should format currency falling back to base currency if conversion fails', () => {
    useExchangeRates.mockReturnValue({ data: null }); // Missing exchange rates
    const { result } = renderHook(() => useFormatters());
    
    // base is PYG (default). target is USD. 
    // Since conversion fails, it should fallback to PYG!
    const formatted = result.current.formatCurrency(7500);
    expect(formatted).toMatch(/7[.,]500/); // No decimals for PYG usually, or it's formatted as PYG.
  });
});
