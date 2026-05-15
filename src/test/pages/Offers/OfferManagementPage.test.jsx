import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OfferManagementPage from '../../../pages/Offers/OfferManagementPage';
import offerApi from '../../../services/offers/offerApi';
import contractApi from '../../../services/contracts/contractApi';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 1, role: 'AGENT' }, isAuthenticated: true }),
}));

vi.mock('../../../services/offers/offerApi', () => ({
  default: {
    getMyOffers: vi.fn(),
    getReceivedOffers: vi.fn(),
    updateOfferStatus: vi.fn(),
    updateOffer: vi.fn(),
  },
}));

vi.mock('../../../services/contracts/contractApi', () => ({
  default: {
    getByProperty: vi.fn(),
  },
}));

vi.mock('../../../hooks/useContracts', () => ({
  useContractsAsListingAgent: () => ({ data: { data: [] } }),
  useContractsAsSeller: () => ({ data: { data: [] } }),
}));

vi.mock('../../../components/Landing/Navbar', () => ({
  default: () => <div>Navbar</div>,
}));

vi.mock('../../../components/Landing/Footer', () => ({
  default: () => <div>Footer</div>,
}));

vi.mock('../../../components/offers/CreateOfferModal', () => ({
  default: () => null,
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/agent/ofertas']}>
        <OfferManagementPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('OfferManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    offerApi.getMyOffers.mockResolvedValue({
      data: {
        data: {
          content: [],
          number: 0,
          totalPages: 0,
        },
      },
    });

    offerApi.getReceivedOffers.mockResolvedValue({
      data: {
        data: {
          content: [
            {
              id: 99,
              propertyId: 11,
              propertyTitle: 'Vivienda de dos piso',
              buyerId: 200,
              buyerName: 'Nicolas Ortiz',
              buyerPhone: '0981123456',
              buyerEmail: 'nicolas@test.com',
              amount: 225000000,
              status: 'ACCEPTED',
              createdAt: '2026-04-19T10:00:00Z',
            },
          ],
          number: 0,
          totalPages: 1,
        },
      },
    });
  });

  it('oculta Generar Contrato cuando ya existe un contrato enviado para esa propiedad y comprador', async () => {
    contractApi.getByProperty.mockResolvedValue([
      {
        id: 501,
        propertyId: 11,
        buyerName: 'Nicolas Ortiz',
        status: 'SENT',
      },
    ]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Vivienda de dos piso/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Generar Contrato/i })).not.toBeInTheDocument();
    });
  });

  it('muestra Generar Contrato cuando no existe contrato activo para la oferta', async () => {
    contractApi.getByProperty.mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Generar Contrato/i })).toBeInTheDocument();
    });
  });

  it('muestra Contactar cuando la oferta aceptada trae un medio de contacto del comprador', async () => {
    contractApi.getByProperty.mockResolvedValue([]);

    renderPage();

    const contactLink = await screen.findByRole('button', { name: /WhatsApp/i });
    expect(contactLink).toHaveAttribute('href', expect.stringContaining('wa.me'));
  });

  it('no muestra Contactar cuando la oferta aceptada no tiene número de WhatsApp', async () => {
    contractApi.getByProperty.mockResolvedValue([]);
    offerApi.getReceivedOffers.mockResolvedValueOnce({
      data: {
        data: {
          content: [
            {
              id: 99,
              propertyId: 11,
              propertyTitle: 'Vivienda de dos piso',
              buyerId: 200,
              buyerName: 'Nicolas Ortiz',
              buyerPhone: '',
              buyerEmail: 'nicolas@test.com',
              amount: 225000000,
              status: 'ACCEPTED',
              createdAt: '2026-04-19T10:00:00Z',
            },
          ],
          number: 0,
          totalPages: 1,
        },
      },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Contactar/i })).not.toBeInTheDocument();
    });
  });
});
