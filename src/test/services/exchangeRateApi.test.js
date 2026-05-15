import { describe, expect, it, vi, beforeEach } from 'vitest';
import api from '../../services/api';
import exchangeRateApi from '../../services/exchangeRateApi';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('exchangeRateApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the aggregated endpoint', async () => {
    api.get.mockResolvedValue({ data: { success: true, data: { rates: [] } } });

    await exchangeRateApi.getExchangeRates();

    expect(api.get).toHaveBeenCalledWith('/exchange-rates');
  });

  it('calls the currency-specific endpoint', async () => {
    api.get.mockResolvedValue({ data: { success: true, data: { currencyCode: 'USD' } } });

    await exchangeRateApi.getExchangeRate('USD');

    expect(api.get).toHaveBeenCalledWith('/exchange-rates/USD');
  });
});
