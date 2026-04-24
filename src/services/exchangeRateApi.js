import api from './api';

const exchangeRateApi = {
  getExchangeRates() {
    return api.get('/api/exchange-rates').then((res) => res.data);
  },

  getExchangeRate(currency) {
    return api.get(`/api/exchange-rates/${currency}`).then((res) => res.data);
  },
};

export default exchangeRateApi;
