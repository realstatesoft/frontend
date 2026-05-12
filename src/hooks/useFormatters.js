import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useCurrencyStore, { DEFAULT_CURRENCY } from '../store/useCurrencyStore';

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

  const formatCurrency = useCallback((amount, currencyOverride) => {
    if (amount == null) return '$0';
    
    const currency = currencyOverride || selectedCurrency || DEFAULT_CURRENCY;
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'PYG' ? 0 : 2,
      maximumFractionDigits: currency === 'PYG' ? 0 : 2,
    }).format(amount);
  }, [locale, selectedCurrency]);

  const formatDate = useCallback((dateStr, options = {}) => {
    if (!dateStr) return '';
    
    const defaultOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };

    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(new Date(dateStr));
  }, [locale]);

  const formatDateTime = useCallback((dateStr, options = {}) => {
    if (!dateStr) return '';
    
    const defaultOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(new Date(dateStr));
  }, [locale]);

  return {
    formatCurrency,
    formatDate,
    formatDateTime,
    locale,
    currency: selectedCurrency,
  };
}
