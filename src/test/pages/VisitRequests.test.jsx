import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VisitRequests from '../../pages/VisitRequests';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 1, role: 'AGENT' }, isAuthenticated: true }),
}));

vi.mock('../../services/visits/visitApi', () => ({
  getMyVisitRequestsAsAgent: vi.fn().mockResolvedValue([
    {
      id: 1,
      propertyId: 101,
      propertyTitle: 'Casa 1',
      buyerName: 'Juan',
      buyerEmail: 'juan@test.com',
      buyerPhone: '123456',
      status: 'PENDING',
      proposedAt: '2024-05-20T10:00:00Z',
      createdAt: '2024-05-19T09:00:00Z',
    },
    {
      id: 2,
      propertyId: 102,
      propertyTitle: 'Casa 2',
      buyerName: 'Maria',
      buyerEmail: 'maria@test.com',
      buyerPhone: '654321',
      status: 'ACCEPTED',
      proposedAt: '2024-05-21T15:00:00Z',
      createdAt: '2024-05-20T14:00:00Z',
    },
  ]),
  acceptVisitRequest: vi.fn().mockResolvedValue({}),
  rejectVisitRequest: vi.fn().mockResolvedValue({}),
  counterProposeVisitRequest: vi.fn().mockResolvedValue({}),
  getAgentAvailability: vi.fn().mockResolvedValue([]),
}));

describe('VisitRequests Page', () => {
  it('renders the visit requests table for an agent', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <VisitRequests />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Solicitudes de Visitas/i })).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Casa 1')).toBeInTheDocument();
      expect(screen.getByText('Juan')).toBeInTheDocument();
      expect(screen.getByText('Casa 2')).toBeInTheDocument();
      expect(screen.getByText('Maria')).toBeInTheDocument();
    });
  });
});
