import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// ─── Mocks de dependencias externas ──────────────────────────────────────────

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { userId: 1, agentProfileId: null }, isAuthenticated: true }),
}));

vi.mock('../../utils/authToken', () => ({
  getUserInfo: () => ({ userId: 1 }),
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire:        vi.fn().mockResolvedValue({ isConfirmed: true }),
    showLoading: vi.fn(),
    close:       vi.fn(),
  },
}));

// Mock de floorPlanApi (el foco principal de este test)
vi.mock('../../services/properties/floorPlanApi', () => ({
  default: {
    uploadFloorPlan:        vi.fn(),
    uploadFloorPlanGeneric: vi.fn(),
    getFloorPlans:          vi.fn(),
    deleteFloorPlan:        vi.fn(),
  },
}));

// Mocks restantes para que el hook pueda inicializarse
vi.mock('../../services/properties/propertyApi', () => ({
  default: { getById: vi.fn(), create: vi.fn(), update: vi.fn() },
}));
vi.mock('../../services/images/imageApi', () => ({
  uploadImage: vi.fn(),
}));
vi.mock('../../services/properties/model3dApi', () => ({
  default: { uploadModel: vi.fn(), uploadModelGeneric: vi.fn() },
}));
vi.mock('../../services/properties/propertyFormMapper', () => ({
  buildCreatePropertyPayload: vi.fn(() => ({})),
  buildUpdatePropertyPayload: vi.fn(() => ({})),
  propertyToForm:             vi.fn(),
}));

import floorPlanApi from '../../services/properties/floorPlanApi';
import propertyApi from '../../services/properties/propertyApi';
import Swal from 'sweetalert2';
import { usePropertyForm } from '../../hooks/usePropertyForm';

// Wrapper con MemoryRouter (el hook usa useNavigate)
const wrapper = ({ children }) => React.createElement(MemoryRouter, null, children);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('usePropertyForm – lógica de Floor Plans', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Estado inicial ───────────────────────────────────────────────────────

  it('inicia con floorPlans vacío y uploadingFloorPlan en false', () => {
    const { result } = renderHook(() => usePropertyForm(), { wrapper });

    expect(result.current.form.floorPlans).toEqual([]);
    expect(result.current.uploadingFloorPlan).toBe(false);
  });

  // ─── removeFloorPlan ─────────────────────────────────────────────────────

  describe('removeFloorPlan(index)', () => {
    it('elimina el plano en el índice indicado', async () => {
      const { result } = renderHook(() => usePropertyForm(), { wrapper });

      // Precargamos dos planos directamente en el estado del form
      act(() => {
        result.current.setArr('floorPlans')([
          { url: 'https://s.t/a.pdf', type: 'FLOOR_PLAN', title: 'a.pdf' },
          { url: 'https://s.t/b.jpg', type: 'FLOOR_PLAN', title: 'b.jpg' },
        ]);
      });

      act(() => {
        result.current.removeFloorPlan(0);
      });

      expect(result.current.form.floorPlans).toHaveLength(1);
      expect(result.current.form.floorPlans[0].title).toBe('b.jpg');
    });

    it('no falla si el array estaba vacío', () => {
      const { result } = renderHook(() => usePropertyForm(), { wrapper });

      act(() => {
        result.current.removeFloorPlan(0);
      });

      expect(result.current.form.floorPlans).toEqual([]);
    });
  });

  // ─── addFloorPlan – validación de tipo ───────────────────────────────────

  describe('addFloorPlan(file) – validación de tipo/extensión', () => {
    it('rechaza archivos sin tipo permitido y muestra alerta', async () => {
      const { result } = renderHook(() => usePropertyForm(), { wrapper });

      const badFile = new File(['x'], 'video.mp4', { type: 'video/mp4' });

      await act(async () => {
        await result.current.addFloorPlan(badFile);
      });

      expect(Swal.fire).toHaveBeenCalledWith(
        'Formato no permitido',
        expect.stringContaining('PDF'),
        'warning'
      );
      expect(floorPlanApi.uploadFloorPlanGeneric).not.toHaveBeenCalled();
    });

    it('no llama a la API si file es null', async () => {
      const { result } = renderHook(() => usePropertyForm(), { wrapper });

      await act(async () => {
        await result.current.addFloorPlan(null);
      });

      expect(floorPlanApi.uploadFloorPlanGeneric).not.toHaveBeenCalled();
    });
  });

  // ─── addFloorPlan – límite de planos ──────────────────────────────────────

  describe('addFloorPlan(file) – límite máximo', () => {
    it('muestra alerta y no hace upload si ya hay 5 planos', async () => {
      const { result } = renderHook(() => usePropertyForm(), { wrapper });

      const fivePlans = Array.from({ length: 5 }, (_, i) => ({
        url: `https://s.t/p${i}.pdf`,
        type: 'FLOOR_PLAN',
        title: `p${i}.pdf`,
      }));

      act(() => {
        result.current.setArr('floorPlans')(fivePlans);
      });

      const pdfFile = new File(['x'], 'extra.pdf', { type: 'application/pdf' });

      await act(async () => {
        await result.current.addFloorPlan(pdfFile);
      });

      expect(Swal.fire).toHaveBeenCalledWith(
        'Límite alcanzado',
        expect.stringContaining('5'),
        'warning'
      );
      expect(floorPlanApi.uploadFloorPlanGeneric).not.toHaveBeenCalled();
    });
  });

  // ─── addFloorPlan – flujo SIN propertyId (genérico) ─────────────────────

  describe('addFloorPlan(file) – upload genérico (sin propertyId)', () => {
    it('llama a uploadFloorPlanGeneric y agrega el plano al form', async () => {
      const { result } = renderHook(() => usePropertyForm(), { wrapper });

      floorPlanApi.uploadFloorPlanGeneric.mockResolvedValue({
        data: {
          success: true,
          data: { url: 'https://s.t/pending/plano.pdf', storageKey: 'floor-plans/pending/plano.pdf' },
        },
      });

      const pdfFile = new File(['pdf'], 'plano.pdf', { type: 'application/pdf' });

      await act(async () => {
        await result.current.addFloorPlan(pdfFile);
      });

      expect(floorPlanApi.uploadFloorPlanGeneric).toHaveBeenCalledWith(pdfFile);
      expect(result.current.form.floorPlans).toHaveLength(1);
      expect(result.current.form.floorPlans[0]).toMatchObject({
        type: 'FLOOR_PLAN',
        url: 'https://s.t/pending/plano.pdf',
        title: 'plano.pdf',
      });
    });

    it('muestra alerta de error si la API lanza una excepción', async () => {
      const { result } = renderHook(() => usePropertyForm(), { wrapper });

      floorPlanApi.uploadFloorPlanGeneric.mockRejectedValue({
        response: { data: { message: 'Archivo demasiado grande' } },
      });

      const pdfFile = new File(['pdf'], 'plano.pdf', { type: 'application/pdf' });

      await act(async () => {
        await result.current.addFloorPlan(pdfFile);
      });

      expect(Swal.fire).toHaveBeenCalledWith(
        'Error',
        expect.stringContaining('Archivo demasiado grande'),
        'error'
      );
      expect(result.current.form.floorPlans).toHaveLength(0);
    });

    it('acepta archivos JPG además de PDF', async () => {
      const { result } = renderHook(() => usePropertyForm(), { wrapper });

      floorPlanApi.uploadFloorPlanGeneric.mockResolvedValue({
        data: { success: true, data: { url: 'https://s.t/p.jpg', storageKey: 'floor-plans/pending/p.jpg' } },
      });

      const jpgFile = new File(['img'], 'plano.jpg', { type: 'image/jpeg' });

      await act(async () => {
        await result.current.addFloorPlan(jpgFile);
      });

      expect(result.current.form.floorPlans[0].url).toBe('https://s.t/p.jpg');
    });
  });

  // ─── addFloorPlan – flujo CON propertyId (asociación inmediata) ──────────

  describe('addFloorPlan(file) – upload con propertyId', () => {
    it('llama a uploadFloorPlan con el propertyId correcto', async () => {
      // Stub para que la carga de la propiedad no falle durante el montaje del hook
      propertyApi.getById.mockResolvedValue({
        data: { success: true, data: { id: 99, title: 'Test property', media: [], floorPlans: [] } },
      });

      const { result } = renderHook(() => usePropertyForm('99'), { wrapper });

      // Esperamos a que el efecto de carga resuelva
      await waitFor(() => expect(propertyApi.getById).toHaveBeenCalledWith('99'));

      floorPlanApi.uploadFloorPlan.mockResolvedValue({
        data: {
          success: true,
          data: { id: 10, url: 'https://s.t/p.pdf', storageKey: 'properties/99/floor-plans/p.pdf' },
        },
      });

      const pdfFile = new File(['pdf'], 'p.pdf', { type: 'application/pdf' });

      await act(async () => {
        await result.current.addFloorPlan(pdfFile);
      });

      expect(floorPlanApi.uploadFloorPlan).toHaveBeenCalledWith('99', pdfFile);
      expect(result.current.form.floorPlans[0]).toMatchObject({
        type: 'FLOOR_PLAN',
        id: 10,
        url: 'https://s.t/p.pdf',
      });
    });
  });
});
