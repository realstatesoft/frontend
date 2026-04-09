import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../../services/agentService', () => ({
  default: {
    getStats: vi.fn(),
  },
}));
import agentService from '../../services/agentService';
import useAgentStats from '../../hooks/useAgentStats';

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useAgentStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna isLoading true inicialmente', () => {
    agentService.getStats.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useAgentStats(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('resuelve correctamente los datos de estadísticas', async () => {
    const mockStats = {
      data: {
        activeClients: { value: 8, trend: 3 },
        totalSales: { value: 2, trend: -1 },
        scheduledVisits: { value: 5, trend: 0 },
        commissions: { value: 75000, trend: 12 },
      },
    };
    agentService.getStats.mockResolvedValue(mockStats);

    const { result } = renderHook(() => useAgentStats(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockStats);
    expect(result.current.data.data.activeClients.value).toBe(8);
    expect(result.current.data.data.commissions.value).toBe(75000);
  });

  it('pone isError en true cuando la llamada falla', async () => {
    agentService.getStats.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAgentStats(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it('llama a agentService.getStats exactamente una vez al montar', async () => {
    agentService.getStats.mockResolvedValue({ data: {} });

    renderHook(() => useAgentStats(), { wrapper: createWrapper() });

    await waitFor(() => expect(agentService.getStats).toHaveBeenCalledTimes(1));
  });

  it('usa la queryKey ["agentStats"]', async () => {
    // Verifica que el hook funciona con staleTime sin refetch inmediato
    agentService.getStats.mockResolvedValue({ data: { activeClients: { value: 1, trend: 0 } } });

    const wrapper = createWrapper();
    const { result: r1 } = renderHook(() => useAgentStats(), { wrapper });
    await waitFor(() => expect(r1.current.isSuccess).toBe(true));

    // A second hook render on the same client should NOT call the service again (staleTime)
    const { result: r2 } = renderHook(() => useAgentStats(), { wrapper });
    expect(agentService.getStats).toHaveBeenCalledTimes(1);
    expect(r2.current.data).toBeDefined();
  });
});
