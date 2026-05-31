import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useCurrencyStore, { DEFAULT_CURRENCY } from '../store/useCurrencyStore';
import useExchangeRates from './useExchangeRates';

const LOCALE_MAP = {
  es: 'es-PY',
  en: 'en-US',
  pr: 'pt-BR',
};

export default function useFormatters() {
  const { i18n } = useTranslation();
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  
  const currentLanguage = i18n.language || 'es';
  const locale = LOCALE_MAP[currentLanguage] || 'es-PY';

  const { data: exchangeRates } = useExchangeRates({
    enabled: true,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const formatCurrency = useCallback((amount, baseCurrencyOverride) => {
    const targetCurrency = selectedCurrency || DEFAULT_CURRENCY;
    const baseCurrency = baseCurrencyOverride || 'PYG';
    let value = amount ?? 0;
    
    if (baseCurrency !== targetCurrency && exchangeRates) {
      const payload = exchangeRates?.data ?? exchangeRates ?? null;
      const rates = Array.isArray(payload?.rates) ? payload.rates : [];
      
      const targetRateObj = rates.find(r => r.currencyCode === targetCurrency);
      const baseRateObj = rates.find(r => r.currencyCode === baseCurrency);
      
      const targetRate = Number(targetRateObj?.sellRate);
      const baseRate = Number(baseRateObj?.sellRate);

      if (baseCurrency === 'PYG' && targetRate > 0) {
        value = value / targetRate;
      } else if (targetCurrency === 'PYG' && baseRate > 0) {
        value = value * baseRate;
      } else if (baseRate > 0 && targetRate > 0) {
        value = (value * baseRate) / targetRate;
      }
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: targetCurrency === 'PYG' ? 0 : 2,
      maximumFractionDigits: targetCurrency === 'PYG' ? 0 : 2,
    }).format(value);
  }, [locale, selectedCurrency, exchangeRates]);

  const formatDate = useCallback((dateStr, options = {}) => {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const defaultOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };

    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date);
  }, [locale]);

  const formatDateTime = useCallback((dateStr, options = {}) => {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const defaultOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date);
  }, [locale]);

  const formatTime = useCallback((dateStr, options = {}) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      ...options,
    }).format(date);
  }, [locale]);

  return {
    formatCurrency,
    formatDate,
    formatDateTime,
    formatTime,
    locale,
    currency: selectedCurrency,
  };
}
