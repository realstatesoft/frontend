import { useQuery } from '@tanstack/react-query';
import exchangeRateApi from '../services/exchangeRateApi';

export const EXCHANGE_RATES_QUERY_KEY = ['exchangeRates'];

export default function useExchangeRates(options = {}) {
  const {
    enabled = true,
    staleTime = 10 * 60 * 1000,
    retry = 1,
    select = (response) => response?.data ?? response ?? null,
  } = options;

  return useQuery({
    queryKey: EXCHANGE_RATES_QUERY_KEY,
    queryFn: exchangeRateApi.getExchangeRates,
    enabled,
    staleTime,
    retry,
    select,
  });
}
