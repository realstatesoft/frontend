import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import OwnerReservationsPage from './OwnerReservationsPage';
import reservationApi from '../../services/reservations/reservationApi';

vi.mock('../../services/reservations/reservationApi', () => ({
  default: { getOwnerReservations: vi.fn() },
}));

const renderPage = () => render(
  <MemoryRouter><OwnerReservationsPage /></MemoryRouter>
);

describe('OwnerReservationsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders a row per reservation with property title, amount and status', async () => {
    reservationApi.getOwnerReservations.mockResolvedValueOnce({
      data: { data: { content: [
        { id: 1, propertyId: 10, propertyTitle: 'Casa A', buyerName: 'Ana', amount: 1500, status: 'ACTIVE' },
        { id: 2, propertyId: 11, propertyTitle: 'Casa B', buyerName: 'Luis', amount: 900,  status: 'CANCELLED' },
      ]}},
    });
    renderPage();
    await waitFor(() => expect(screen.getByText('Casa A')).toBeInTheDocument());
    expect(screen.getByText('Casa B')).toBeInTheDocument();
    expect(screen.getByText(/\$1,500/)).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('CANCELLED')).toBeInTheDocument();
  });

  it('shows an empty-state alert when there are no reservations', async () => {
    reservationApi.getOwnerReservations.mockResolvedValueOnce({ data: { data: { content: [] } } });
    renderPage();
    await waitFor(() => expect(screen.getByText(/no hay reservas/i)).toBeInTheDocument());
  });
});