import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import Swal from 'sweetalert2';
import AgentReservationsPage from './AgentReservationsPage';
import reservationApi from '../../services/reservations/reservationApi';

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn() },
}));

vi.mock('../../services/reservations/reservationApi', () => ({
  default: {
    getAssignedReservations: vi.fn(),
    confirm: vi.fn(),
    cancel: vi.fn(),
  },
}));

vi.mock('../../components/messages/NewConversationModal', () => ({
  default: ({ isOpen }) => isOpen ? <div data-testid="msg-modal" /> : null,
}));

const pageResponse = (items, totalPages = 1) => ({
  data: { data: { content: items, totalPages } },
});

const renderPage = () => render(
  <MemoryRouter><AgentReservationsPage /></MemoryRouter>
);

describe('AgentReservationsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders a card per reservation with Spanish status label', async () => {
    reservationApi.getAssignedReservations.mockResolvedValueOnce(pageResponse([
      { id: 1, propertyId: 10, propertyTitle: 'Casa A', buyerName: 'Ana',  buyerId: 5, buyerEmail: 'ana@t.com',  amount: 1500, status: 'PENDING', createdAt: '2026-05-01' },
      { id: 2, propertyId: 11, propertyTitle: 'Casa B', buyerName: 'Luis', buyerId: 6, buyerEmail: 'luis@t.com', amount: 900,  status: 'ACTIVE',  createdAt: '2026-05-01' },
    ]));
    renderPage();
    await waitFor(() => expect(screen.getByText('Casa A')).toBeInTheDocument());
    expect(screen.getByText('Casa B')).toBeInTheDocument();
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Activa').length).toBeGreaterThan(0);
  });

  it('shows Confirmar and Rechazar for PENDING, only Cancelar for ACTIVE', async () => {
    reservationApi.getAssignedReservations.mockResolvedValueOnce(pageResponse([
      { id: 1, propertyId: 10, propertyTitle: 'Casa A', buyerName: 'Ana', buyerId: 5, buyerEmail: 'a@t.com', amount: 1000, status: 'PENDING', createdAt: '2026-05-01' },
      { id: 2, propertyId: 11, propertyTitle: 'Casa B', buyerName: 'Luis', buyerId: 6, buyerEmail: 'l@t.com', amount: 800, status: 'ACTIVE', createdAt: '2026-05-01' },
    ]));
    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /rechazar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar reserva/i })).toBeInTheDocument();
  });

  it('calls confirm API when Confirmar is clicked', async () => {
    reservationApi.getAssignedReservations.mockResolvedValue(pageResponse([
      { id: 3, propertyId: 10, propertyTitle: 'Casa A', buyerName: 'Ana', buyerId: 5, buyerEmail: 'a@t.com', amount: 1000, status: 'PENDING', createdAt: '2026-05-01' },
    ]));
    reservationApi.confirm.mockResolvedValue({});
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /confirmar/i }));
    await waitFor(() => expect(reservationApi.confirm).toHaveBeenCalledWith(3));
  });

  it('calls cancel API after Swal when Rechazar is clicked and confirmed', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true, value: 'no disponible' });
    reservationApi.getAssignedReservations.mockResolvedValue(pageResponse([
      { id: 3, propertyId: 10, propertyTitle: 'Casa A', buyerName: 'Ana', buyerId: 5, buyerEmail: 'a@t.com', amount: 1000, status: 'PENDING', createdAt: '2026-05-01' },
    ]));
    reservationApi.cancel.mockResolvedValue({});
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /rechazar/i }));
    await waitFor(() => expect(reservationApi.cancel).toHaveBeenCalledWith(3, { reason: 'no disponible' }));
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
      { id: 1, propertyId: 10, propertyTitle: 'Casa A', buyerName: 'Ana', buyerId: 5, buyerEmail: 'a@t.com', amount: 1000, status: 'ACTIVE', createdAt: '2026-05-01' },
    ], 2));
    renderPage();
    await waitFor(() => expect(screen.getByText('Casa A')).toBeInTheDocument());
    expect(await screen.findByText('2')).toBeInTheDocument();
  });
});
