import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import Swal from 'sweetalert2';
import MyReservationsPage from './MyReservationsPage';
import reservationApi from '../../services/reservations/reservationApi';

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn() },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('../../components/Landing/Navbar', () => ({
  default: () => <nav data-testid="custom-navbar" />,
}));

vi.mock('../../services/reservations/reservationApi', () => ({
  default: { getMyReservations: vi.fn(), cancel: vi.fn() },
}));

const pageResponse = (items, totalPages = 1) => ({
  data: { data: { content: items, totalPages } },
});

const renderPage = () => render(
  <MemoryRouter><MyReservationsPage /></MemoryRouter>
);

describe('MyReservationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the navbar and a back button that calls navigate(-1)', async () => {
    reservationApi.getMyReservations.mockResolvedValue(pageResponse([]));
    renderPage();
    expect(screen.getByTestId('custom-navbar')).toBeInTheDocument();
    const back = await screen.findByRole('button', { name: /volver/i });
    fireEvent.click(back);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('renders one card per reservation with formatted amount and Spanish status label', async () => {
    reservationApi.getMyReservations.mockResolvedValue(pageResponse([
      { id: 1, propertyId: 10, propertyTitle: 'Casa A', amount: 1500, status: 'ACTIVE', createdAt: '2026-05-01' },
      { id: 2, propertyId: 11, propertyTitle: 'Casa B', amount: 900,  status: 'CANCELLED', createdAt: '2026-04-20' },
    ]));
    renderPage();
    await waitFor(() => expect(screen.getByText('Casa A')).toBeInTheDocument());
    expect(screen.getByText('Casa B')).toBeInTheDocument();
    expect(screen.getByText(/\$1,500/)).toBeInTheDocument();
    expect(screen.getAllByText('Activa').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cancelada').length).toBeGreaterThan(0);
  });

  it('shows a link to the property page in the title', async () => {
    reservationApi.getMyReservations.mockResolvedValue(pageResponse([
      { id: 1, propertyId: 42, propertyTitle: 'Casa A', amount: 1500, status: 'ACTIVE', createdAt: '2026-05-01' },
    ]));
    renderPage();
    const link = await screen.findByRole('link', { name: 'Casa A' });
    expect(link).toHaveAttribute('href', '/properties/42');
  });

  it('navigates to the property show page when the "Ver propiedad" button is clicked', async () => {
    reservationApi.getMyReservations.mockResolvedValue(pageResponse([
      { id: 1, propertyId: 42, propertyTitle: 'Casa A', amount: 1500, status: 'ACTIVE', createdAt: '2026-05-01' },
    ]));
    renderPage();
    const verBtn = await screen.findByRole('button', { name: /ver propiedad/i });
    fireEvent.click(verBtn);
    expect(navigateMock).toHaveBeenCalledWith('/properties/42');
  });

  it('opens Swal and calls cancel API when cancel button is clicked and confirmed', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true, value: 'motivo test' });
    reservationApi.getMyReservations.mockResolvedValue(pageResponse([
      { id: 1, propertyId: 42, propertyTitle: 'Casa A', amount: 1500, status: 'ACTIVE', createdAt: '2026-05-01' },
    ]));
    reservationApi.cancel.mockResolvedValue({});
    renderPage();
    const cancelBtn = await screen.findByRole('button', { name: /^cancelar$/i });
    fireEvent.click(cancelBtn);
    await waitFor(() => expect(reservationApi.cancel).toHaveBeenCalledWith(1, { reason: 'motivo test' }));
  });

  it('does not call cancel API when Swal is dismissed', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    reservationApi.getMyReservations.mockResolvedValue(pageResponse([
      { id: 1, propertyId: 42, propertyTitle: 'Casa A', amount: 1500, status: 'ACTIVE', createdAt: '2026-05-01' },
    ]));
    renderPage();
    const cancelBtn = await screen.findByRole('button', { name: /^cancelar$/i });
    fireEvent.click(cancelBtn);
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(reservationApi.cancel).not.toHaveBeenCalled();
  });

  it('shows an empty-state alert when there are no reservations', async () => {
    reservationApi.getMyReservations.mockResolvedValue(pageResponse([]));
    renderPage();
    await waitFor(() => expect(screen.getByText(/aún no tienes reservas/i)).toBeInTheDocument());
  });

  it('calls API with status param when filter changes', async () => {
    reservationApi.getMyReservations.mockResolvedValue(pageResponse([]));
    renderPage();
    await waitFor(() => expect(reservationApi.getMyReservations).toHaveBeenCalledWith(0, 10, null));
    const select = screen.getByRole('combobox', { name: /filtrar por estado/i });
    fireEvent.change(select, { target: { value: 'PENDING' } });
    await waitFor(() =>
      expect(reservationApi.getMyReservations).toHaveBeenCalledWith(0, 10, 'PENDING')
    );
  });

  it('renders pagination when totalPages > 1', async () => {
    reservationApi.getMyReservations.mockResolvedValue(pageResponse([
      { id: 1, propertyId: 10, propertyTitle: 'Casa A', amount: 1000, status: 'ACTIVE', createdAt: '2026-05-01' },
    ], 3));
    renderPage();
    await waitFor(() => expect(screen.getByText('Casa A')).toBeInTheDocument());
    expect(await screen.findByText('2')).toBeInTheDocument();
  });
});
