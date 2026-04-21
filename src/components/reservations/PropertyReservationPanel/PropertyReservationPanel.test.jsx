import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Swal from 'sweetalert2';
import PropertyReservationPanel from './PropertyReservationPanel';
import reservationApi from '../../../services/reservations/reservationApi';

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn().mockResolvedValue({ isConfirmed: true }) },
}));

vi.mock('../../../services/reservations/reservationApi', () => ({
  default: {
    getByProperty: vi.fn(),
    confirm: vi.fn(),
    cancel: vi.fn(),
    createReservation: vi.fn(),
  },
}));

const property = { id: 1, title: 'Casa', price: 100000, status: 'PUBLISHED', ownerId: 2 };

describe('PropertyReservationPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reservationApi.getByProperty.mockResolvedValue({ data: { data: [] } });
  });

  it('shows reservar button to USER who is not owner', async () => {
    render(<PropertyReservationPanel property={property} currentUser={{ id: 99, role: 'USER' }} defaultPercent={1} />);
    expect(await screen.findByRole('button', { name: /reservar/i })).toBeInTheDocument();
  });

  it('hides reservar button for the owner', () => {
    render(<PropertyReservationPanel property={property} currentUser={{ userId: 2, role: 'USER' }} defaultPercent={1} />);
    expect(screen.queryByRole('button', { name: /reservar/i })).not.toBeInTheDocument();
  });

  it('does not render anything when property is not PUBLISHED', () => {
    const property = { id: 1, title: 'X', price: 100000, status: 'PENDING', ownerId: 2 };
    const { container } = render(
      <PropertyReservationPanel property={property} currentUser={{ userId: 99, role: 'USER' }} defaultPercent={1} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('fires a success Swal after the modal reports a created reservation', async () => {
    const property = { id: 1, title: 'Casa', price: 100000, status: 'PUBLISHED', ownerId: 2 };
    render(<PropertyReservationPanel property={property} currentUser={{ userId: 99, role: 'USER' }} defaultPercent={1} />);

    fireEvent.click(screen.getByRole('button', { name: /reservar/i }));
    reservationApi.createReservation.mockResolvedValueOnce({ data: { data: { id: 77, amount: 1000, status: 'PENDING' } } });
    fireEvent.submit(screen.getByRole('button', { name: /^confirmar$/i }).closest('form'));

    await act(async () => {
      await new Promise(r => setTimeout(r, 100));
    });

    expect(reservationApi.createReservation).toHaveBeenCalled();
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: 'success', title: expect.stringMatching(/reserva enviada/i) })
    );
  });
});