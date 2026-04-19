import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAgentStats } from './useAgentStats';
import agentApi from '../services/agents/agentApi';

vi.mock('../services/agents/agentApi', () => ({
  default: {
    getStats: vi.fn(),
  }
}));

describe('useAgentStats hook', () => {
  it('returns loading state initially and then data', async () => {
    const mockStats = { data: { activeClients: 5, pendingVisits: 2 } };
    agentApi.getStats.mockResolvedValue(mockStats);

    const { result } = renderHook(() => useAgentStats());

    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.data).toEqual(mockStats.data);
    expect(result.current.error).toBeNull();
  });

  it('returns error if api fails', async () => {
    agentApi.getStats.mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useAgentStats());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeNull();
  });
});
