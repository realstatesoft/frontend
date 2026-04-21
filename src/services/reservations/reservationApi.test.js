import { describe, it, expect, vi, beforeEach } from 'vitest';
import reservationApi from './reservationApi';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('reservationApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('createReservation POSTs to /reservations', async () => {
    api.post.mockResolvedValue({ data: { data: { id: 1 } } });
    await reservationApi.createReservation({ propertyId: 5, amount: 100, notes: null });
    expect(api.post).toHaveBeenCalledWith('/reservations', { propertyId: 5, amount: 100, notes: null });
  });

  it('getMyReservations GETs /reservations/my with pagination', async () => {
    api.get.mockResolvedValue({ data: { data: { content: [] } } });
    await reservationApi.getMyReservations(2, 5);
    expect(api.get).toHaveBeenCalledWith('/reservations/my?page=2&size=5');
  });

  it('cancel POSTs to /reservations/:id/cancel', async () => {
    api.post.mockResolvedValue({ data: { data: {} } });
    await reservationApi.cancel(9, { reason: 'no' });
    expect(api.post).toHaveBeenCalledWith('/reservations/9/cancel', { reason: 'no' });
  });
});