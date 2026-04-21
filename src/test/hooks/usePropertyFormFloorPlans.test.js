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

// Mock de floorPlanApi (foco principal de este test)
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
    it('elimina plano pendiente (sin id) directamente del estado sin llamar API', async () => {
      const { result } = renderHook(() => usePropertyForm(), { wrapper });

      act(() => {
        result.current.setArr('floorPlans')([
          { url: 'https://s.t/a.pdf', type: 'FLOOR_PLAN', title: 'a.pdf' }, // sin id
          { url: 'https://s.t/b.jpg', type: 'FLOOR_PLAN', title: 'b.jpg' }, // sin id
        ]);
      });

      await act(async () => {
        await result.current.removeFloorPlan(0);
      });

      expect(floorPlanApi.deleteFloorPlan).not.toHaveBeenCalled();
      expect(result.current.form.floorPlans).toHaveLength(1);
      expect(result.current.form.floorPlans[0].title).toBe('b.jpg');
    });

    it('no falla si el array estaba vacío', async () => {
      const { result } = renderHook(() => usePropertyForm(), { wrapper });

      await act(async () => {
        await result.current.removeFloorPlan(0);
      });

      expect(result.current.form.floorPlans).toEqual([]);
    });

    it('llama a deleteFloorPlan y elimina el estado si el plano tiene id (persistido)', async () => {
      // Necesita propertyId para poder llamar al API
      propertyApi.getById.mockResolvedValue({
        data: { success: true, data: { id: 5, title: 'Test', media: [], floorPlans: [] } },
      });
      const { result } = renderHook(() => usePropertyForm('5'), { wrapper });
      await waitFor(() => expect(propertyApi.getById).toHaveBeenCalled());

      act(() => {
        result.current.setArr('floorPlans')([
          { id: 10, url: 'https://s.t/persistido.pdf', type: 'FLOOR_PLAN', title: 'persistido.pdf' },
        ]);
      });

      floorPlanApi.deleteFloorPlan.mockResolvedValue({ data: { success: true } });

      await act(async () => {
        await result.current.removeFloorPlan(0);
      });

      expect(floorPlanApi.deleteFloorPlan).toHaveBeenCalledWith('5', 10);
      expect(result.current.form.floorPlans).toHaveLength(0);
    });

    it('hace rollback del estado si deleteFloorPlan lanza un error', async () => {
      propertyApi.getById.mockResolvedValue({
        data: { success: true, data: { id: 5, title: 'Test', media: [], floorPlans: [] } },
      });
      const { result } = renderHook(() => usePropertyForm('5'), { wrapper });
      await waitFor(() => expect(propertyApi.getById).toHaveBeenCalled());

      act(() => {
        result.current.setArr('floorPlans')([
          { id: 10, url: 'https://s.t/p.pdf', type: 'FLOOR_PLAN', title: 'p.pdf' },
        ]);
      });

      floorPlanApi.deleteFloorPlan.mockRejectedValue({
        message: 'Server error',
      });

      await act(async () => {
        await result.current.removeFloorPlan(0);
      });

      // Rollback: el plano debe seguir en el estado
      expect(result.current.form.floorPlans).toHaveLength(1);
      expect(Swal.fire).toHaveBeenCalledWith('Error', expect.stringContaining('Server error'), 'error');
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

  // ─── addFloorPlan – validación de tamaño ─────────────────────────────────

  describe('addFloorPlan(file) – validación de tamaño', () => {
    it('rechaza archivos mayores a 10 MB con alerta', async () => {
      const { result } = renderHook(() => usePropertyForm(), { wrapper });

      // Creamos un File con size > 10MB usando Object.defineProperty
      const bigFile = new File(['x'], 'grande.pdf', { type: 'application/pdf' });
      Object.defineProperty(bigFile, 'size', { value: 11 * 1024 * 1024 }); // 11 MB

      await act(async () => {
        await result.current.addFloorPlan(bigFile);
      });

      expect(Swal.fire).toHaveBeenCalledWith(
        'Archivo demasiado grande',
        expect.stringContaining('10'),
        'warning'
      );
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

    it('muestra alerta de error si la API retorna success: false', async () => {
      const { result } = renderHook(() => usePropertyForm(), { wrapper });

      floorPlanApi.uploadFloorPlanGeneric.mockResolvedValue({
        data: { success: false, message: 'Tipo de archivo no permitido' },
      });

      const pdfFile = new File(['pdf'], 'plano.pdf', { type: 'application/pdf' });

      await act(async () => {
        await result.current.addFloorPlan(pdfFile);
      });

      expect(Swal.fire).toHaveBeenCalledWith(
        'Error',
        expect.stringContaining('Tipo de archivo no permitido'),
        'error'
      );
      expect(result.current.form.floorPlans).toHaveLength(0);
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
      propertyApi.getById.mockResolvedValue({
        data: { success: true, data: { id: 99, title: 'Test property', media: [], floorPlans: [] } },
      });
      const { result } = renderHook(() => usePropertyForm('99'), { wrapper });
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
