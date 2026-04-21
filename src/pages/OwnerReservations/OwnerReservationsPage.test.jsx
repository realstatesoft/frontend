import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import OwnerReservationsPage from './OwnerReservationsPage';
import reservationApi from '../../services/reservations/reservationApi';

vi.mock('../../services/reservations/reservationApi', () => ({
  default: { getOwnerReservations: vi.fn() },
}));

const pageResponse = (items, totalPages = 1) => ({
  data: { data: { content: items, totalPages } },
});

const renderPage = () => render(
  <MemoryRouter><OwnerReservationsPage /></MemoryRouter>
);

describe('OwnerReservationsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders a row per reservation with property title, amount and Spanish status label', async () => {
    reservationApi.getOwnerReservations.mockResolvedValueOnce(pageResponse([
      { id: 1, propertyId: 10, propertyTitle: 'Casa A', buyerName: 'Ana',  amount: 1500, status: 'ACTIVE' },
      { id: 2, propertyId: 11, propertyTitle: 'Casa B', buyerName: 'Luis', amount: 900,  status: 'CANCELLED' },
    ]));
    renderPage();
    await waitFor(() => expect(screen.getByText('Casa A')).toBeInTheDocument());
    expect(screen.getByText('Casa B')).toBeInTheDocument();
    expect(screen.getByText(/\$1,500/)).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Activa' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Cancelada' })).toBeInTheDocument();
  });

  it('shows an empty-state alert when there are no reservations', async () => {
    reservationApi.getOwnerReservations.mockResolvedValueOnce(pageResponse([]));
    renderPage();
    await waitFor(() => expect(screen.getByText(/no hay reservas/i)).toBeInTheDocument());
  });

  it('calls API with status param when filter changes', async () => {
    reservationApi.getOwnerReservations.mockResolvedValue(pageResponse([]));
    renderPage();
    await waitFor(() => expect(reservationApi.getOwnerReservations).toHaveBeenCalledWith(0, 10, null));

    const select = screen.getByRole('combobox', { name: /filtrar por estado/i });
    fireEvent.change(select, { target: { value: 'PENDING' } });

    await waitFor(() =>
      expect(reservationApi.getOwnerReservations).toHaveBeenCalledWith(0, 10, 'PENDING')
    );
  });

  it('renders pagination when totalPages > 1', async () => {
    reservationApi.getOwnerReservations.mockResolvedValue(pageResponse([
      { id: 1, propertyId: 10, propertyTitle: 'Casa A', buyerName: 'Ana', amount: 1000, status: 'ACTIVE' },
    ], 3));
    renderPage();
    await waitFor(() => expect(screen.getByText('Casa A')).toBeInTheDocument());
    expect(await screen.findByText('2')).toBeInTheDocument();
  });
});
