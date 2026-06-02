import { formatPrice } from './priceFormat';
import { DEFAULT_CURRENCY, normalizeCurrency } from '../store/useCurrencyStore';

export const EXCHANGE_RATE_REFERENCE_TEXT =
  'Los precios en moneda extranjera son referenciales y se calculan según la cotización de Cambios Chaco.';

const FOREIGN_LOCALE_BY_CURRENCY = {
  USD: 'en-US',
  BRL: 'pt-BR',
};

const FOREIGN_SYMBOL_BY_CURRENCY = {
  USD: 'US$',
  BRL: 'R$',
};

function normalizeRatesPayload(exchangeRates) {
  const payload = exchangeRates?.data ?? exchangeRates ?? null;
  const rates = Array.isArray(payload?.rates) ? payload.rates : [];

  const ratesByCurrency = rates.reduce((acc, rate) => {
    if (rate?.currencyCode) {
      acc[String(rate.currencyCode).toUpperCase()] = rate;
    }
    return acc;
  }, {});

  return {
    payload,
    ratesByCurrency,
  };
}

function getSellRate(exchangeRates, currencyCode) {
  const normalizedCurrency = normalizeCurrency(currencyCode);
  if (!normalizedCurrency || normalizedCurrency === DEFAULT_CURRENCY) {
    return null;
  }

  const { ratesByCurrency } = normalizeRatesPayload(exchangeRates);
  const rate = ratesByCurrency[normalizedCurrency];
  const sellRate = Number(rate?.sellRate);

  return Number.isFinite(sellRate) && sellRate > 0 ? sellRate : null;
}

function formatForeignAmount(amount, currencyCode) {
  const normalizedCurrency = normalizeCurrency(currencyCode);
  if (!normalizedCurrency || normalizedCurrency === DEFAULT_CURRENCY) {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const locale = FOREIGN_LOCALE_BY_CURRENCY[normalizedCurrency] ?? 'en-US';
  const symbol = FOREIGN_SYMBOL_BY_CURRENCY[normalizedCurrency] ?? normalizedCurrency;

  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${symbol} ${formattedNumber}`;
}

export function isForeignCurrency(currencyCode) {
  const normalized = normalizeCurrency(currencyCode);
  return normalized === 'USD' || normalized === 'BRL';
}

export function convertPropertyPriceFromPyg(pricePyg, currencyCode, exchangeRates) {
  const price = Number(pricePyg);
  if (!Number.isFinite(price)) {
    return null;
  }

  const normalizedCurrency = normalizeCurrency(currencyCode) ?? DEFAULT_CURRENCY;

  if (normalizedCurrency === DEFAULT_CURRENCY) {
    return {
      basePricePyg: price,
      currencyCode: DEFAULT_CURRENCY,
      convertedAmount: price,
      exchangeRate: null,
      approximate: false,
      fallbackToPyg: false,
    };
  }

  const sellRate = getSellRate(exchangeRates, normalizedCurrency);
  if (!sellRate) {
    return {
      basePricePyg: price,
      currencyCode: DEFAULT_CURRENCY,
      convertedAmount: price,
      exchangeRate: null,
      approximate: false,
      fallbackToPyg: true,
    };
  }

  return {
    basePricePyg: price,
    currencyCode: normalizedCurrency,
    convertedAmount: price / sellRate,
    exchangeRate: sellRate,
    approximate: true,
    fallbackToPyg: false,
  };
}

export function convertPriceFilterToPyg(priceAmount, currencyCode, exchangeRates) {
  const price = Number(priceAmount);
  if (!Number.isFinite(price)) {
    return null;
  }

  const normalizedCurrency = normalizeCurrency(currencyCode) ?? DEFAULT_CURRENCY;

  if (normalizedCurrency === DEFAULT_CURRENCY) {
    return {
      baseAmount: price,
      currencyCode: DEFAULT_CURRENCY,
      convertedAmount: price,
      exchangeRate: null,
      fallbackToPyg: false,
    };
  }

  const sellRate = getSellRate(exchangeRates, normalizedCurrency);
  if (!sellRate) {
    return {
      baseAmount: price,
      currencyCode: normalizedCurrency,
      convertedAmount: null,
      exchangeRate: null,
      fallbackToPyg: false,
    };
  }

  return {
    baseAmount: price,
    currencyCode: normalizedCurrency,
    convertedAmount: price * sellRate,
    exchangeRate: sellRate,
    fallbackToPyg: false,
  };
}

export function formatPropertyPrice(pricePyg, currencyCode, exchangeRates) {
  const conversion = convertPropertyPriceFromPyg(pricePyg, currencyCode, exchangeRates);

  if (!conversion) {
    return {
      displayValue: '',
      currencyCode: DEFAULT_CURRENCY,
      approximate: false,
      fallbackToPyg: true,
      convertedAmount: null,
      exchangeRate: null,
      label: '',
    };
  }

  const displayValue = formatForeignAmount(conversion.convertedAmount, conversion.currencyCode);

  return {
    ...conversion,
    displayValue,
    label: conversion.approximate ? `Aprox. ${displayValue}` : displayValue,
  };
}

export function getPropertyPriceInfoText() {
  return EXCHANGE_RATE_REFERENCE_TEXT;
}
