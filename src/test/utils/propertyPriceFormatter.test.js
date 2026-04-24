import { describe, expect, it } from 'vitest';
import {
  EXCHANGE_RATE_REFERENCE_TEXT,
  convertPropertyPriceFromPyg,
  convertPriceFilterToPyg,
  formatPropertyPrice,
  getPropertyPriceInfoText,
  isForeignCurrency,
} from '../../utils/propertyPriceFormatter';

const exchangeRates = {
  rates: [
    { currencyCode: 'USD', sellRate: 6360 },
    { currencyCode: 'BRL', sellRate: 1260 },
  ],
};

describe('propertyPriceFormatter', () => {
  it('formats PYG as fallback when currency is PYG or rates are missing', () => {
    const result = formatPropertyPrice(350000000, 'PYG');

    expect(result.currencyCode).toBe('PYG');
    expect(result.approximate).toBe(false);
    expect(result.displayValue).toBe('350.000.000');
    expect(result.label).toBe('350.000.000');
  });

  it('converts to USD using sell rate and marks the value as approximate', () => {
    const result = formatPropertyPrice(6360000, 'USD', exchangeRates);

    expect(result.currencyCode).toBe('USD');
    expect(result.approximate).toBe(true);
    expect(result.fallbackToPyg).toBe(false);
    expect(result.exchangeRate).toBe(6360);
    expect(result.displayValue).toBe('US$ 1,000.00');
    expect(result.label).toBe('Aprox. US$ 1,000.00');
  });

  it('converts to BRL using sell rate and marks the value as approximate', () => {
    const result = formatPropertyPrice(2520000, 'BRL', exchangeRates);

    expect(result.currencyCode).toBe('BRL');
    expect(result.displayValue).toBe('R$ 2.000,00');
    expect(result.label).toBe('Aprox. R$ 2.000,00');
  });

  it('falls back to PYG when rates are missing', () => {
    const result = formatPropertyPrice(1000000, 'USD', null);

    expect(result.currencyCode).toBe('PYG');
    expect(result.fallbackToPyg).toBe(true);
    expect(result.displayValue).toBe('1.000.000');
  });

  it('exposes a reusable info text', () => {
    expect(getPropertyPriceInfoText()).toBe(EXCHANGE_RATE_REFERENCE_TEXT);
  });

  it('detects foreign currencies', () => {
    expect(isForeignCurrency('USD')).toBe(true);
    expect(isForeignCurrency('BRL')).toBe(true);
    expect(isForeignCurrency('PYG')).toBe(false);
  });

  it('can convert without formatting', () => {
    const result = convertPropertyPriceFromPyg(6360000, 'USD', exchangeRates);
    expect(result.convertedAmount).toBe(1000);
  });

  it('converts displayed filter amounts back to PYG', () => {
    const result = convertPriceFilterToPyg(100, 'USD', exchangeRates);

    expect(result.currencyCode).toBe('USD');
    expect(result.convertedAmount).toBe(636000);
    expect(result.fallbackToPyg).toBe(false);
  });

  it('falls back to the original amount when exchange rates are not available', () => {
    const result = convertPriceFilterToPyg(100, 'BRL', null);

    expect(result.currencyCode).toBe('PYG');
    expect(result.convertedAmount).toBe(100);
    expect(result.fallbackToPyg).toBe(true);
  });
});
