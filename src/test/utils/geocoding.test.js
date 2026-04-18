import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reverseGeocode } from '../../utils/geocoding';

describe('geocoding utils', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('reverseGeocode', () => {
    it('returns formatted location data on success', async () => {
      const mockResponse = {
        display_name: 'Calle Falsa 123, Asunción, Paraguay',
        address: {
          city: 'Asunción',
          state: 'Central',
          country: 'Paraguay'
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await reverseGeocode(-25.2637, -57.5759);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=-25.2637&lon=-57.5759&addressdetails=1',
        expect.objectContaining({ headers: expect.any(Object) })
      );
      
      expect(result).toEqual({
        displayName: 'Calle Falsa 123, Asunción, Paraguay',
        city: 'Asunción',
        department: 'Central',
        country: 'Paraguay'
      });
    });

    it('handles alternative address fields like town or village', async () => {
      const mockResponse = {
        display_name: 'Pueblito, Interior',
        address: { town: 'Pueblito', state: 'Guairá' }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await reverseGeocode(-25.0, -56.0);
      expect(result.city).toBe('Pueblito');
      expect(result.country).toBe('');
    });

    it('throws error if HTTP response is not ok', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      });

      await expect(reverseGeocode(10, 10)).rejects.toThrowError('Reverse geocoding failed with HTTP 403');
    });
  });
});
