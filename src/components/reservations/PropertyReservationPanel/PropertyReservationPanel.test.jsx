import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropertyReservationPanel from './PropertyReservationPanel';
import reservationApi from '../../../services/reservations/reservationApi';

vi.mock('../../../services/reservations/reservationApi', () => ({
  default: {
    getByProperty: vi.fn(),
    confirm: vi.fn(),
    cancel: vi.fn(),
  },
}));

const property = { id: 1, title: 'Casa', price: 100000, status: 'PUBLISHED', owner: { id: 2 } };

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
    render(<PropertyReservationPanel property={property} currentUser={{ id: 2, role: 'USER' }} defaultPercent={1} />);
    expect(screen.queryByRole('button', { name: /reservar/i })).not.toBeInTheDocument();
  });
});