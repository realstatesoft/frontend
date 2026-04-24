import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useExchangeRates from '../../hooks/useExchangeRates';
import exchangeRateApi from '../../services/exchangeRateApi';

vi.mock('../../services/exchangeRateApi', () => ({
  default: {
    getExchangeRates: vi.fn(),
  },
}));

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe('useExchangeRates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and unwraps exchange rates', async () => {
    exchangeRateApi.getExchangeRates.mockResolvedValue({
      success: true,
      data: { rates: [{ currencyCode: 'USD', sellRate: 6360 }] },
    });

    const { result } = renderHook(() => useExchangeRates(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.rates[0].currencyCode).toBe('USD');
  });

  it('allows disabling the query', () => {
    const { result } = renderHook(() => useExchangeRates({ enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(exchangeRateApi.getExchangeRates).not.toHaveBeenCalled();
  });
});
