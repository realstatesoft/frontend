import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ContractEditPage from '../../../pages/Contracts/ContractEditPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 1, role: 'AGENT' }, isAuthenticated: true }),
}));

vi.mock('../../../hooks/useContracts', () => ({
  useContractDetail: vi.fn().mockReturnValue({
    data: { id: 1, status: 'DRAFT', contractNumber: 'CT-123', contractType: 'SALE' },
    isLoading: false
  }),
  useUpdateContract: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateContractStatus: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('../../../services/agents/agentApi', () => ({
  getAllAgents: vi.fn().mockResolvedValue({ data: { content: [] } }),
}));

describe('ContractEditPage', () => {
  it('renders the contract edit heading after loading', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ContractEditPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Editar Borrador/i)).toBeInTheDocument();
    });
  });
});
