import { useCallback, useMemo } from 'react';
import useCurrencyStore, { DEFAULT_CURRENCY, normalizeCurrency } from '../store/useCurrencyStore';
import useExchangeRates from './useExchangeRates';
import { formatPropertyPrice, getPropertyPriceInfoText } from '../utils/propertyPriceFormatter';

export default function usePropertyPriceDisplay(pricePyg) {
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  const normalizedCurrency = normalizeCurrency(selectedCurrency) ?? DEFAULT_CURRENCY;
  const isForeignCurrency = normalizedCurrency !== DEFAULT_CURRENCY;
  const { data: exchangeRates } = useExchangeRates({
    enabled: true,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const priceDisplay = useMemo(
    () => formatPropertyPrice(pricePyg, normalizedCurrency, exchangeRates),
    [pricePyg, normalizedCurrency, exchangeRates]
  );

  const formatPrice = useCallback(
    (value) => formatPropertyPrice(value, normalizedCurrency, exchangeRates),
    [normalizedCurrency, exchangeRates]
  );

  return {
    ...priceDisplay,
    currencyCode: normalizedCurrency,
    isForeignCurrency,
    formatPrice,
    showReferenceNote: isForeignCurrency && !priceDisplay.fallbackToPyg,
    referenceText: getPropertyPriceInfoText(),
  };
}
