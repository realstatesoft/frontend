import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import AgentReservationsPage from './AgentReservationsPage';
import reservationApi from '../../services/reservations/reservationApi';

vi.mock('../../services/reservations/reservationApi', () => ({
  default: { getAssignedReservations: vi.fn() },
}));

const pageResponse = (items, totalPages = 1) => ({
  data: { data: { content: items, totalPages } },
});

const renderPage = () => render(
  <MemoryRouter><AgentReservationsPage /></MemoryRouter>
);

describe('AgentReservationsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders a row per reservation with Spanish status label', async () => {
    reservationApi.getAssignedReservations.mockResolvedValueOnce(pageResponse([
      { id: 1, propertyId: 10, propertyTitle: 'Casa A', buyerName: 'Ana',  amount: 1500, status: 'PENDING' },
      { id: 2, propertyId: 11, propertyTitle: 'Casa B', buyerName: 'Luis', amount: 900,  status: 'ACTIVE' },
    ]));
    renderPage();
    await waitFor(() => expect(screen.getByText('Casa A')).toBeInTheDocument());
    expect(screen.getByText('Casa B')).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Pendiente' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Activa' })).toBeInTheDocument();
  });

  it('shows empty-state alert when no reservations', async () => {
    reservationApi.getAssignedReservations.mockResolvedValueOnce(pageResponse([]));
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/no hay reservas sobre tus propiedades asignadas/i)).toBeInTheDocument()
    );
  });

  it('calls API with status param when filter changes', async () => {
    reservationApi.getAssignedReservations.mockResolvedValue(pageResponse([]));
    renderPage();
    await waitFor(() =>
      expect(reservationApi.getAssignedReservations).toHaveBeenCalledWith(0, 10, null)
    );
    const select = screen.getByRole('combobox', { name: /filtrar por estado/i });
    fireEvent.change(select, { target: { value: 'ACTIVE' } });
    await waitFor(() =>
      expect(reservationApi.getAssignedReservations).toHaveBeenCalledWith(0, 10, 'ACTIVE')
    );
  });

  it('renders page numbers when totalPages > 1', async () => {
    reservationApi.getAssignedReservations.mockResolvedValue(pageResponse([
      { id: 1, propertyId: 10, propertyTitle: 'Casa A', buyerName: 'Ana', amount: 1000, status: 'ACTIVE' },
    ], 2));
    renderPage();
    await waitFor(() => expect(screen.getByText('Casa A')).toBeInTheDocument());
    expect(await screen.findByText('2')).toBeInTheDocument();
  });
});
