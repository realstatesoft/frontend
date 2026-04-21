import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReserveModal from './ReserveModal';
import reservationApi from '../../../services/reservations/reservationApi';

vi.mock('../../../services/reservations/reservationApi', () => ({
  default: { createReservation: vi.fn() },
}));

describe('ReserveModal', () => {
  const property = { id: 7, title: 'Depto Centro', price: 100000 };

  beforeEach(() => vi.clearAllMocks());

  it('pre-fills amount from price * defaultPercent', () => {
    render(<ReserveModal show property={property} defaultPercent={1} onClose={() => {}} onCreated={() => {}} />);
    expect(screen.getByLabelText(/monto/i)).toHaveValue(1000);
  });
});