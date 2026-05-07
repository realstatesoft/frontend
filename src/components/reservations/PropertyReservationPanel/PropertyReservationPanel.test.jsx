import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Swal from 'sweetalert2';
import PropertyReservationPanel from './PropertyReservationPanel';
import reservationApi from '../../../services/reservations/reservationApi';

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn().mockResolvedValue({ isConfirmed: true }) },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

vi.mock('../../../services/reservations/reservationApi', () => ({
  default: {
    getByProperty: vi.fn(),
    getMyForProperty: vi.fn(),
    confirm: vi.fn(),
    cancel: vi.fn(),
    createReservation: vi.fn(),
  },
}));

const property = { id: 1, title: 'Casa', price: 100000, status: 'PUBLISHED', ownerId: 2, category: 'RENT' };

describe('PropertyReservationPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reservationApi.getByProperty.mockResolvedValue({ data: { data: [] } });
    reservationApi.getMyForProperty.mockResolvedValue({ data: { data: null } });
  });

  it('shows reservar button to USER who is not owner', async () => {
    render(<PropertyReservationPanel property={property} currentUser={{ userId: 99, role: 'USER' }} defaultPercent={1} />);
    expect(await screen.findByRole('button', { name: /enviar solicitud/i })).toBeInTheDocument();
  });

  it('hides reservar button for the owner', () => {
    render(<PropertyReservationPanel property={property} currentUser={{ userId: 2, role: 'USER' }} defaultPercent={1} />);
    expect(screen.queryByRole('button', { name: /enviar solicitud/i })).not.toBeInTheDocument();
  });

  it('does not render anything when property is not PUBLISHED', () => {
    const unpublished = { ...property, status: 'PENDING' };
    const { container } = render(
      <PropertyReservationPanel property={unpublished} currentUser={{ userId: 99, role: 'USER' }} defaultPercent={1} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('does not render anything when property category is SALE', () => {
    const saleProp = { ...property, category: 'SALE' };
    const { container } = render(
      <PropertyReservationPanel property={saleProp} currentUser={{ userId: 99, role: 'USER' }} defaultPercent={1} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders for SALE_OR_RENT properties', async () => {
    const mixedProp = { ...property, category: 'SALE_OR_RENT' };
    reservationApi.getMyForProperty.mockResolvedValue({ data: { data: null } });
    render(<PropertyReservationPanel property={mixedProp} currentUser={{ userId: 99, role: 'USER' }} defaultPercent={1} />);
    expect(await screen.findByRole('button', { name: /enviar solicitud/i })).toBeInTheDocument();
  });

  it('fires a success Swal after the modal reports a created reservation', async () => {
    render(<PropertyReservationPanel property={property} currentUser={{ userId: 99, role: 'USER' }} defaultPercent={1} />);
    fireEvent.click(await screen.findByRole('button', { name: /enviar solicitud/i }));
    reservationApi.createReservation.mockResolvedValueOnce({ data: { data: { id: 77, amount: 1000, status: 'PENDING' } } });
    fireEvent.submit(document.querySelector('form'));
    await waitFor(() => {
      expect(reservationApi.createReservation).toHaveBeenCalled();
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: 'success', title: expect.any(String) })
      );
    });
  });

  it('hides the reserve button and shows the already-reserved card when buyer has an active reservation', async () => {
    reservationApi.getMyForProperty.mockResolvedValueOnce({
      data: { data: { id: 55, amount: 1500, status: 'PENDING', expiresAt: null } },
    });
    render(<PropertyReservationPanel property={property} currentUser={{ userId: 99, role: 'USER' }} defaultPercent={1} />);
    await waitFor(() => expect(screen.queryByRole('button', { name: /enviar solicitud/i })).not.toBeInTheDocument());
    expect(screen.getByText(/tu solicitud/i)).toBeInTheDocument();
    expect(screen.getByText(/\$1,500/)).toBeInTheDocument();
  });
});
