import { describe, it, expect, vi, beforeEach } from 'vitest';
import floorPlanApi from '../../services/properties/floorPlanApi';

// Mock del servicio api base
vi.mock('../../services/api', () => ({
  default: {
    post:   vi.fn(),
    get:    vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../../services/api';

describe('floorPlanApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── uploadFloorPlan ───────────────────────────────────────────────────────

  describe('uploadFloorPlan(propertyId, file)', () => {
    it('envía FormData a la ruta correcta con Content-Type limpiado (undefined)', async () => {
      const file = new File(['pdf'], 'plano.pdf', { type: 'application/pdf' });
      api.post.mockResolvedValue({ data: { success: true, data: { url: 'https://s.test/plano.pdf' } } });

      await floorPlanApi.uploadFloorPlan(42, file);

      // Verifica ruta, cuerpo FormData, y que Content-Type se pase como undefined
      // para limpiar el default 'application/json' de la instancia de Axios.
      expect(api.post).toHaveBeenCalledWith(
        '/properties/42/floor-plans',
        expect.any(FormData),
        expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': undefined }) })
      );
      const formData = api.post.mock.calls[0][1];
      expect(formData.get('file')).toBeDefined();
    });

    it('propaga errores del servidor', async () => {
      api.post.mockRejectedValue(new Error('Upload failed'));
      const file = new File(['x'], 'p.pdf', { type: 'application/pdf' });

      await expect(floorPlanApi.uploadFloorPlan(1, file)).rejects.toThrow('Upload failed');
    });
  });

  // ─── uploadFloorPlanGeneric ────────────────────────────────────────────────

  describe('uploadFloorPlanGeneric(file)', () => {
    it('envía FormData a /floor-plans/upload con Content-Type limpiado', async () => {
      const file = new File(['img'], 'plano.jpg', { type: 'image/jpeg' });
      api.post.mockResolvedValue({ data: { success: true, data: { url: 'https://s.test/pending/plano.jpg' } } });

      await floorPlanApi.uploadFloorPlanGeneric(file);

      expect(api.post).toHaveBeenCalledWith(
        '/properties/floor-plans/upload',
        expect.any(FormData),
        expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': undefined }) })
      );
    });

    it('propaga errores del servidor', async () => {
      api.post.mockRejectedValue(new Error('Server error'));
      const file = new File(['x'], 'p.jpg', { type: 'image/jpeg' });

      await expect(floorPlanApi.uploadFloorPlanGeneric(file)).rejects.toThrow('Server error');
    });
  });

  // ─── getFloorPlans ─────────────────────────────────────────────────────────

  describe('getFloorPlans(propertyId)', () => {
    it('hace GET a la ruta correcta con el propertyId', async () => {
      api.get.mockResolvedValue({ data: { success: true, data: [] } });

      await floorPlanApi.getFloorPlans(10);

      expect(api.get).toHaveBeenCalledWith('/properties/10/floor-plans');
    });

    it('retorna la lista de planos de la respuesta', async () => {
      const mockPlans = [
        { id: 1, url: 'https://s.test/p1.pdf', type: 'FLOOR_PLAN' },
        { id: 2, url: 'https://s.test/p2.jpg', type: 'FLOOR_PLAN' },
      ];
      api.get.mockResolvedValue({ data: { success: true, data: mockPlans } });

      const result = await floorPlanApi.getFloorPlans(10);

      expect(result.data.data).toHaveLength(2);
      expect(result.data.data[0].type).toBe('FLOOR_PLAN');
    });

    it('propaga errores de red', async () => {
      api.get.mockRejectedValue(new Error('Network error'));

      await expect(floorPlanApi.getFloorPlans(10)).rejects.toThrow('Network error');
    });
  });

  // ─── deleteFloorPlan ───────────────────────────────────────────────────────

  describe('deleteFloorPlan(propertyId, mediaId)', () => {
    it('hace DELETE a la ruta correcta con propertyId y mediaId', async () => {
      api.delete.mockResolvedValue({ data: { success: true } });

      await floorPlanApi.deleteFloorPlan(5, 99);

      expect(api.delete).toHaveBeenCalledWith('/properties/5/floor-plans/99');
    });

    it('propaga errores del servidor (403, 404, etc.)', async () => {
      api.delete.mockRejectedValue(new Error('Forbidden'));

      await expect(floorPlanApi.deleteFloorPlan(5, 99)).rejects.toThrow('Forbidden');
    });

    it('propaga errores de red', async () => {
      api.delete.mockRejectedValue(new Error('Network error'));

      await expect(floorPlanApi.deleteFloorPlan(5, 99)).rejects.toThrow('Network error');
    });
  });
});
