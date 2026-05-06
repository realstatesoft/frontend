import api from './api';

function normalizeExchangeRateCurrency(currency) {
  if (typeof currency !== 'string' || !currency.trim()) {
    throw new Error('Currency is required');
  }

  const normalizedCurrency = currency.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
    throw new Error('Invalid currency code');
  }

  return normalizedCurrency;
}

const exchangeRateApi = {
  getExchangeRates() {
    return api.get('/api/exchange-rates').then((res) => res.data);
  },

  getExchangeRate(currency) {
    const normalizedCurrency = normalizeExchangeRateCurrency(currency);
    return api.get(`/api/exchange-rates/${encodeURIComponent(normalizedCurrency)}`).then((res) => res.data);
  },
};

export default exchangeRateApi;
