import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import Swal from 'sweetalert2';
import OwnerReservationsPage from './OwnerReservationsPage';
import reservationApi from '../../services/reservations/reservationApi';

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn() },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

vi.mock('../../components/Landing/Navbar', () => ({
  default: () => <nav data-testid="custom-navbar" />,
}));
vi.mock('../../components/Landing/Footer', () => ({
  default: () => <footer data-testid="footer" />,
}));

vi.mock('../../services/reservations/reservationApi', () => ({
  default: {
    getOwnerReservations: vi.fn(),
    confirm: vi.fn(),
    cancel: vi.fn(),
  },
}));

const pageResponse = (items, totalPages = 1) => ({
  data: { data: { content: items, totalPages } },
});

const renderPage = () => render(
  <MemoryRouter><OwnerReservationsPage /></MemoryRouter>
);

describe('OwnerReservationsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders a card per reservation with property title, amount and Spanish status label', async () => {
    reservationApi.getOwnerReservations.mockResolvedValueOnce(pageResponse([
      { id: 1, propertyId: 10, propertyTitle: 'Casa A', buyerName: 'Ana',  buyerEmail: 'ana@test.com',  amount: 1500, status: 'ACTIVE',    createdAt: '2026-05-01' },
      { id: 2, propertyId: 11, propertyTitle: 'Casa B', buyerName: 'Luis', buyerEmail: 'luis@test.com', amount: 900,  status: 'CANCELLED', createdAt: '2026-04-20' },
    ]));
    renderPage();
    await waitFor(() => expect(screen.getByText('Casa A')).toBeInTheDocument());
    expect(screen.getByText('Casa B')).toBeInTheDocument();
    expect(screen.getByText(/\$1,500/)).toBeInTheDocument();
    expect(screen.getAllByText('Activa').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cancelada').length).toBeGreaterThan(0);
  });

  it('shows Confirmar and Rechazar buttons for a PENDING reservation', async () => {
    reservationApi.getOwnerReservations.mockResolvedValueOnce(pageResponse([
      { id: 3, propertyId: 10, propertyTitle: 'Casa A', buyerName: 'Ana', buyerEmail: 'ana@test.com', amount: 1000, status: 'PENDING', createdAt: '2026-05-01' },
    ]));
    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /rechazar/i })).toBeInTheDocument();
  });

  it('calls confirm API and reloads when Confirmar is clicked', async () => {
    reservationApi.getOwnerReservations.mockResolvedValue(pageResponse([
      { id: 3, propertyId: 10, propertyTitle: 'Casa A', buyerName: 'Ana', buyerEmail: 'a@t.com', amount: 1000, status: 'PENDING', createdAt: '2026-05-01' },
    ]));
    reservationApi.confirm.mockResolvedValue({});
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /confirmar/i }));
    await waitFor(() => expect(reservationApi.confirm).toHaveBeenCalledWith(3));
    await waitFor(() => expect(reservationApi.getOwnerReservations).toHaveBeenCalledTimes(2));
  });

  it('opens Swal and calls cancel API when Rechazar is clicked and confirmed', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true, value: 'no conviene' });
    reservationApi.getOwnerReservations.mockResolvedValue(pageResponse([
      { id: 3, propertyId: 10, propertyTitle: 'Casa A', buyerName: 'Ana', buyerEmail: 'a@t.com', amount: 1000, status: 'PENDING', createdAt: '2026-05-01' },
    ]));
    reservationApi.cancel.mockResolvedValue({});
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /rechazar/i }));
    await waitFor(() => expect(reservationApi.cancel).toHaveBeenCalledWith(3, { reason: 'no conviene' }));
  });

  it('does not call cancel API when Swal is dismissed', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    reservationApi.getOwnerReservations.mockResolvedValue(pageResponse([
      { id: 3, propertyId: 10, propertyTitle: 'Casa A', buyerName: 'Ana', buyerEmail: 'a@t.com', amount: 1000, status: 'PENDING', createdAt: '2026-05-01' },
    ]));
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /rechazar/i }));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(reservationApi.cancel).not.toHaveBeenCalled();
  });

  it('shows Cancelar reserva button (no Confirmar) for an ACTIVE reservation', async () => {
    reservationApi.getOwnerReservations.mockResolvedValueOnce(pageResponse([
      { id: 4, propertyId: 10, propertyTitle: 'Casa A', buyerName: 'Ana', buyerEmail: 'a@t.com', amount: 1000, status: 'ACTIVE', createdAt: '2026-05-01' },
    ]));
    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: /cancelar reserva/i })).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /confirmar/i })).not.toBeInTheDocument();
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
      { id: 1, propertyId: 10, propertyTitle: 'Casa A', buyerName: 'Ana', buyerEmail: 'a@t.com', amount: 1000, status: 'ACTIVE', createdAt: '2026-05-01' },
    ], 3));
    renderPage();
    await waitFor(() => expect(screen.getByText('Casa A')).toBeInTheDocument());
    expect(await screen.findByText('2')).toBeInTheDocument();
  });
});
