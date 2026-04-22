import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePropertyFloorPlans } from '../../hooks/usePropertyFloorPlans';
import floorPlanApi from '../../services/properties/floorPlanApi';

// Mock del servicio
vi.mock('../../services/properties/floorPlanApi', () => ({
  default: {
    getFloorPlans: vi.fn(),
  },
}));

describe('usePropertyFloorPlans hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no hace fetch si no se provee propertyId', async () => {
    const { result } = renderHook(() => usePropertyFloorPlans());
    
    expect(result.current.loading).toBe(false);
    expect(floorPlanApi.getFloorPlans).not.toHaveBeenCalled();
    expect(result.current.floorPlans).toEqual([]);
    expect(result.current.selectedPlan).toBeNull();
  });

  it('carga los planos correctamente y selecciona el primero', async () => {
    const mockPlans = [
      { id: 1, url: 'plano1.pdf', type: 'FLOOR_PLAN', title: 'Plano 1' },
      { id: 2, url: 'plano2.jpg', type: 'FLOOR_PLAN', title: 'Plano 2' },
    ];
    
    floorPlanApi.getFloorPlans.mockResolvedValue({
      data: { success: true, data: mockPlans },
    });

    const { result } = renderHook(() => usePropertyFloorPlans('123'));

    // Al montar, el estado es loading true
    expect(result.current.loading).toBe(true);

    // Esperar a que resuelva la promesa
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(floorPlanApi.getFloorPlans).toHaveBeenCalledWith('123');
    expect(result.current.error).toBeNull();
    expect(result.current.floorPlans).toEqual(mockPlans);
    expect(result.current.selectedPlan).toEqual(mockPlans[0]);
  });

  it('meneja el caso donde el backend no retorna planos (array vacío)', async () => {
    floorPlanApi.getFloorPlans.mockResolvedValue({
      data: { success: true, data: [] },
    });

    const { result } = renderHook(() => usePropertyFloorPlans('123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.floorPlans).toEqual([]);
    expect(result.current.selectedPlan).toBeNull();
  });

  it('maneja errores en la petición a la API', async () => {
    floorPlanApi.getFloorPlans.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => usePropertyFloorPlans('123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('No se pudieron cargar los planos de la propiedad.');
    expect(result.current.floorPlans).toEqual([]);
    expect(result.current.selectedPlan).toBeNull();
  });

  it('permite cambiar el plan seleccionado manualmente', async () => {
    const mockPlans = [
      { id: 1, url: 'plano1.pdf', type: 'FLOOR_PLAN', title: 'Plano 1' },
      { id: 2, url: 'plano2.jpg', type: 'FLOOR_PLAN', title: 'Plano 2' },
    ];
    
    floorPlanApi.getFloorPlans.mockResolvedValue({
      data: { success: true, data: mockPlans },
    });

    const { result } = renderHook(() => usePropertyFloorPlans('123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setSelectedPlan(mockPlans[1]);
    });

    expect(result.current.selectedPlan).toEqual(mockPlans[1]);
  });
});
