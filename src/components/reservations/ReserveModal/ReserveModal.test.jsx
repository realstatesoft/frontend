import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ReserveModal from './ReserveModal';
import reservationApi from '../../../services/reservations/reservationApi';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options = {}) => {
      if (key === 'modal.description') return `Reservar ${options.title ?? ''}`;
      if (key === 'modal.amount') return 'Monto';
      if (key === 'modal.notes') return 'Notas';
      if (key === 'modal.submit') return 'Confirmar';
      if (key === 'modal.cancel') return 'Cancelar';
      if (key === 'modal.invalidAmount') return 'El monto debe ser mayor a cero';
      return key;
    },
  }),
}));

vi.mock('../../../services/reservations/reservationApi', () => ({
  default: { createReservation: vi.fn() },
}));

describe('ReserveModal', () => {
  const property = { id: 7, title: 'Depto Centro', price: 100000 };

  beforeEach(() => vi.clearAllMocks());

  it('pre-fills amount from price * defaultPercent', () => {
    render(<ReserveModal show property={property} defaultPercent={1} onClose={() => {}} onCreated={() => {}} />);
    expect(screen.getByLabelText(/monto/i)).toHaveValue('1000');
  });

  it('shows the amount formatted as MXN currency below the input', () => {
    const property = { id: 5, title: 'Casa', price: 100000, status: 'PUBLISHED' };
    render(<ReserveModal show property={property} defaultPercent={1} onClose={() => {}} onCreated={() => {}} />);
    expect(screen.getByTestId('reserve-amount-formatted')).toHaveTextContent('$1,000');
  });

  it('calls createReservation with the correct payload and invokes onCreated + onClose on success', async () => {
    const onCreated = vi.fn();
    const onClose = vi.fn();
    reservationApi.createReservation.mockResolvedValueOnce({ data: { data: { id: 1, amount: 1000 } } });

    render(
      <ReserveModal
        show
        property={property}
        defaultPercent={1}
        onClose={onClose}
        onCreated={onCreated}
      />
    );

    const amountInput = screen.getByLabelText(/monto/i);
    fireEvent.change(amountInput, { target: { value: '2000' } });
    fireEvent.blur(amountInput);

    const form = screen.getByRole('dialog').querySelector('form') || amountInput.closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(reservationApi.createReservation).toHaveBeenCalledWith({
        propertyId: 7,
        amount: 2000,
        notes: '',
      });
    });

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith({ id: 1, amount: 1000 });
    });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows error alert and does not call createReservation when amount is zero', async () => {
    render(
      <ReserveModal
        show
        property={property}
        defaultPercent={0}
        onClose={() => {}}
        onCreated={() => {}}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(reservationApi.createReservation).not.toHaveBeenCalled();
  });
});