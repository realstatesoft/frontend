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

const renderPage = () => render(
  <MemoryRouter><MyReservationsPage /></MemoryRouter>
);

describe('MyReservationsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the navbar and a back button that calls navigate(-1)', async () => {
    reservationApi.getMyReservations.mockResolvedValue({ data: { data: { content: [] } } });
    renderPage();
    expect(screen.getByTestId('custom-navbar')).toBeInTheDocument();
    const back = await screen.findByRole('button', { name: /volver/i });
    fireEvent.click(back);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('renders one row per reservation with formatted amount and status', async () => {
    reservationApi.getMyReservations.mockResolvedValue({
      data: { data: { content: [
        { id: 1, propertyId: 10, propertyTitle: 'Casa A', amount: 1500, status: 'ACTIVE' },
        { id: 2, propertyId: 11, propertyTitle: 'Casa B', amount: 900,  status: 'CANCELLED' },
      ]}},
    });
    renderPage();
    await waitFor(() => expect(screen.getByText('Casa A')).toBeInTheDocument());
    expect(screen.getByText('Casa B')).toBeInTheDocument();
    expect(screen.getByText(/\$1,500/)).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('navigates to the property show page when a row is clicked', async () => {
    reservationApi.getMyReservations.mockResolvedValue({
      data: { data: { content: [
        { id: 1, propertyId: 42, propertyTitle: 'Casa A', amount: 1500, status: 'ACTIVE' },
      ]}},
    });
    renderPage();
    const row = await screen.findByText('Casa A');
    fireEvent.click(row.closest('tr'));
    expect(navigateMock).toHaveBeenCalledWith('/properties/42');
  });

  it('navigates to the property show page when the "Ver" button is clicked', async () => {
    reservationApi.getMyReservations.mockResolvedValue({
      data: { data: { content: [
        { id: 1, propertyId: 42, propertyTitle: 'Casa A', amount: 1500, status: 'ACTIVE' },
      ]}},
    });
    renderPage();
    const verBtn = await screen.findByRole('button', { name: /ver propiedad/i });
    fireEvent.click(verBtn);
    expect(navigateMock).toHaveBeenCalledWith('/properties/42');
  });

  it('does not navigate to the property page when the Cancel button is clicked', async () => {
    reservationApi.getMyReservations.mockResolvedValue({
      data: { data: { content: [
        { id: 1, propertyId: 42, propertyTitle: 'Casa A', amount: 1500, status: 'ACTIVE' },
      ]}},
    });
    reservationApi.cancel.mockResolvedValue({});
    window.prompt = vi.fn().mockReturnValue('motivo');
    renderPage();
    const cancelBtn = await screen.findByRole('button', { name: /^cancelar$/i });
    fireEvent.click(cancelBtn);
    await waitFor(() => expect(reservationApi.cancel).toHaveBeenCalledWith(1, { reason: 'motivo' }));
    expect(navigateMock).not.toHaveBeenCalledWith(expect.stringMatching(/^\/properties\//));
  });

  it('shows an empty-state alert when there are no reservations', async () => {
    reservationApi.getMyReservations.mockResolvedValue({ data: { data: { content: [] } } });
    renderPage();
    await waitFor(() => expect(screen.getByText(/aún no tienes reservas/i)).toBeInTheDocument());
  });
});
