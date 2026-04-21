import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import MyReservationsPage from './MyReservationsPage';
import reservationApi from '../../services/reservations/reservationApi';

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

  it('renders one row per reservation with formatted amount and Spanish status label', async () => {
    reservationApi.getMyReservations.mockResolvedValue(pageResponse([
      { id: 1, propertyId: 10, propertyTitle: 'Casa A', amount: 1500, status: 'ACTIVE' },
      { id: 2, propertyId: 11, propertyTitle: 'Casa B', amount: 900,  status: 'CANCELLED' },
    ]));
    renderPage();
    await waitFor(() => expect(screen.getByText('Casa A')).toBeInTheDocument());
    expect(screen.getByText('Casa B')).toBeInTheDocument();
    expect(screen.getByText(/\$1,500/)).toBeInTheDocument();
    // badge inside the table (not the filter <option>)
    expect(screen.getByRole('cell', { name: 'Activa' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Cancelada' })).toBeInTheDocument();
  });

  it('shows a link to the property page in the title cell', async () => {
    reservationApi.getMyReservations.mockResolvedValue(pageResponse([
      { id: 1, propertyId: 42, propertyTitle: 'Casa A', amount: 1500, status: 'ACTIVE' },
    ]));
    renderPage();
    const link = await screen.findByRole('link', { name: 'Casa A' });
    expect(link).toHaveAttribute('href', '/properties/42');
  });

  it('navigates to the property show page when the "Ver" button is clicked', async () => {
    reservationApi.getMyReservations.mockResolvedValue(pageResponse([
      { id: 1, propertyId: 42, propertyTitle: 'Casa A', amount: 1500, status: 'ACTIVE' },
    ]));
    renderPage();
    const verBtn = await screen.findByRole('button', { name: /ver propiedad/i });
    fireEvent.click(verBtn);
    expect(navigateMock).toHaveBeenCalledWith('/properties/42');
  });

  it('does not navigate to the property page when the Cancel button is clicked', async () => {
    reservationApi.getMyReservations.mockResolvedValue(pageResponse([
      { id: 1, propertyId: 42, propertyTitle: 'Casa A', amount: 1500, status: 'ACTIVE' },
    ]));
    reservationApi.cancel.mockResolvedValue({});
    window.prompt = vi.fn().mockReturnValue('motivo');
    renderPage();
    const cancelBtn = await screen.findByRole('button', { name: /^cancelar$/i });
    fireEvent.click(cancelBtn);
    await waitFor(() => expect(reservationApi.cancel).toHaveBeenCalledWith(1, { reason: 'motivo' }));
    expect(navigateMock).not.toHaveBeenCalledWith(expect.stringMatching(/^\/properties\//));
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
      { id: 1, propertyId: 10, propertyTitle: 'Casa A', amount: 1000, status: 'ACTIVE' },
    ], 3));
    renderPage();
    await waitFor(() => expect(screen.getByText('Casa A')).toBeInTheDocument());
    expect(await screen.findByText('2')).toBeInTheDocument();
  });
});
