import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { i18n, initializeI18n } from '../../../i18n';
import ContractCreatePage from '../../../pages/Contracts/ContractCreatePage';
import propertyApi from '../../../services/properties/propertyApi';
import { searchClients } from '../../../services/clients/clientApi';
import { getAllAgents } from '../../../services/agents/agentApi';

let currentUserRole = 'AGENT';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 1, role: currentUserRole }, isAuthenticated: true }),
}));

vi.mock('../../../services/properties/propertyApi', () => ({
  default: {
    getAgentScope: vi.fn().mockResolvedValue({ data: { data: { content: [{ id: 101, title: 'Casa Test', ownerId: 5, ownerName: 'Seller' }] } } }),
    getById: vi.fn().mockResolvedValue({ data: { data: { id: 101, title: 'Casa Test', ownerId: 5, ownerName: 'Seller', price: 150000, commissionPct: '5.00', agentId: 1 } } }),
    getMe: vi.fn().mockResolvedValue({ data: { data: { content: [] } } }),
  }
}));

vi.mock('../../../services/clients/clientApi', () => ({
  searchClients: vi.fn().mockResolvedValue({ content: [{ id: 201, userId: 10, name: 'Buyer', email: 'buyer@test.com' }] }),
}));

vi.mock('../../../services/agents/agentApi', () => ({
  getAllAgents: vi.fn().mockResolvedValue({ data: { content: [] } }),
}));

vi.mock('../../../hooks/useContracts', () => ({
  useCreateContract: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
  useContractDetail: vi.fn().mockReturnValue({ data: null, isLoading: false }),
  useUpdateContract: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateContractStatus: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));

describe('ContractCreatePage', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    currentUserRole = 'AGENT';
    await initializeI18n();
  });

  it('renders and allows selecting property and buyer', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ContractCreatePage />
          </MemoryRouter>
        </QueryClientProvider>
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Nuevo Contrato/i)).toBeInTheDocument();
    });

    // Select property - Using more specific selector
    const propertySelect = screen.getByRole('combobox', { name: /Propiedad/i });
    fireEvent.change(propertySelect, { target: { value: '101' } });

    await waitFor(() => {
        expect(propertySelect).toHaveValue('101');
    });

    expect(screen.getByText(/Guardar borrador/i)).toBeInTheDocument();
  });

  it('preselecciona al comprador cuando llega desde una oferta aceptada', async () => {
    searchClients.mockResolvedValueOnce({ content: [] });

    render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/contratos/nuevo?propertyId=101&buyerId=10&buyerName=Buyer%20Offer&amount=150000']}>
            <ContractCreatePage />
          </MemoryRouter>
        </QueryClientProvider>
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /^Comprador/i })).toHaveValue('10');
    });

    expect(screen.getByRole('option', { name: /Buyer Offer/i })).toBeInTheDocument();
  });

  it('reemplaza el placeholder del comprador por el cliente real cuando el agente lo tiene en su lista', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/agent/contratos/nuevo?propertyId=101&buyerId=10&amount=150000']}>
            <ContractCreatePage />
          </MemoryRouter>
        </QueryClientProvider>
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /^Comprador/i })).toHaveValue('10');
    });

    expect(screen.getByRole('option', { name: /Buyer \(buyer@test\.com\)/i })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Cliente #10/i })).not.toBeInTheDocument();
  });

  it('muestra un flujo guiado para owner sin secciones editables de agentes y comisiones', async () => {
    currentUserRole = 'OWNER';

    render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/contratos/nuevo?propertyId=101&buyerId=10&buyerName=Buyer%20Offer&amount=150000']}>
            <ContractCreatePage />
          </MemoryRouter>
        </QueryClientProvider>
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/intermediación/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/tu propiedad y comisiones se completan automáticamente/i)).toBeInTheDocument();
    expect(screen.queryByText(/Agentes \(opcionales\)/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Comisiones \(%\)/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/agente asignado/i)).toHaveLength(2);
    expect(screen.getByText(/5\.00%/i)).toBeInTheDocument();
  });
});
