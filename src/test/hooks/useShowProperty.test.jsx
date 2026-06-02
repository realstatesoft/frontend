import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const mockedNavigate = vi.fn();
let mockedPropertyId = '123';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../services/properties/propertyApi', () => ({
  default: {
    getById: vi.fn(),
    getSimilar: vi.fn(),
    changeStatus: vi.fn(),
    update: vi.fn(),
    trash: vi.fn(),
    registerView: vi.fn(),
    getViewCount: vi.fn(),
    registerRecentView: vi.fn().mockResolvedValue(undefined),
    getRecentProperties: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
  },
}));

vi.mock('../../services/propertyFlagsApi', () => ({
  default: {
    getActiveFlagCount: vi.fn(),
  },
}));

vi.mock('../../hooks/usePropertyPriceDisplay', () => ({
  default: vi.fn(() => ({
    label: '₲ 100.000',
    displayValue: '₲ 100.000',
    approximate: false,
    fallbackToPyg: false,
    currencyCode: 'PYG',
    isForeignCurrency: false,
    showReferenceNote: false,
    referenceText: 'Los precios en moneda extranjera son referenciales y se calculan según la cotización de Cambios Chaco.',
    formatPrice: (value) => ({
      label: `₲ ${String(value)}`,
      displayValue: `₲ ${String(value)}`,
      approximate: false,
      fallbackToPyg: false,
      currencyCode: 'PYG',
    }),
  })),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: mockedPropertyId }),
    useNavigate: () => mockedNavigate,
  };
});

import { useAuth } from '../../hooks/useAuth';
import propertyApi from '../../services/properties/propertyApi';
import propertyFlagsApi from '../../services/propertyFlagsApi';
import {
  __resetShowPropertyViewRegistrationForTests,
  useShowProperty,
} from '../../hooks/useShowProperty';

describe('useShowProperty', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetShowPropertyViewRegistrationForTests();
    mockedPropertyId = '123';
    useAuth.mockReturnValue({
      user: { userId: 1, role: 'USER' },
      isAuthenticated: true,
    });

    propertyApi.getById.mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 123,
          title: 'Casa Test',
          ownerId: 1,
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
          media: [],
        },
      },
    });

    propertyApi.getSimilar.mockResolvedValue({
      data: {
        success: true,
        data: [],
      },
    });

    propertyFlagsApi.getActiveFlagCount.mockResolvedValue({
      data: 0,
    });
  });

  it('registra la visita y carga el conteo al montar', async () => {
    propertyApi.registerView.mockResolvedValue({
      data: {
        success: true,
        data: 7,
      },
    });
    propertyApi.getViewCount.mockResolvedValue({
      data: {
        success: true,
        data: 7,
      },
    });

    const { result } = renderHook(() => useShowProperty());

    await waitFor(() => {
      expect(propertyApi.registerView).toHaveBeenCalledWith('123');
      expect(propertyApi.getViewCount).toHaveBeenCalledWith('123');
      expect(result.current.viewCount).toBe(7);
    });
  });

  it('debe registrar la vista reciente si el usuario está autenticado', async () => {
    renderHook(() => useShowProperty());

    await waitFor(() => {
      expect(propertyApi.registerRecentView).toHaveBeenCalledWith('123');
    });
  });


  it('no rompe la carga si falla el registro o el conteo de vistas', async () => {
    propertyApi.registerView.mockRejectedValue(new Error('register failed'));
    propertyApi.getViewCount.mockRejectedValue(new Error('count failed'));

    const { result } = renderHook(() => useShowProperty());

    await waitFor(() => {
      expect(propertyApi.registerView).toHaveBeenCalledTimes(1);
      expect(result.current.viewCount).toBeNull();
    });
  });

  it('no vuelve a registrar la vista al remount para la misma propiedad', async () => {
    propertyApi.registerView.mockResolvedValue({
      data: { success: true, data: 7 },
    });
    propertyApi.getViewCount.mockResolvedValue({
      data: { success: true, data: 7 },
    });

    const firstRender = renderHook(() => useShowProperty());

    await waitFor(() => {
      expect(propertyApi.registerView).toHaveBeenCalledTimes(1);
    });

    firstRender.unmount();

    renderHook(() => useShowProperty());

    await waitFor(() => {
      expect(propertyApi.registerView).toHaveBeenCalledTimes(1);
      expect(propertyApi.getViewCount).toHaveBeenCalledTimes(2);
    });
  });

  it('ignora respuestas viejas del conteo cuando cambia la propiedad', async () => {
    let resolveFirstCount;
    let resolveSecondCount;

    propertyApi.registerView.mockResolvedValue({
      data: { success: true, data: 1 },
    });
    propertyApi.getById.mockImplementation(async (id) => ({
      data: {
        success: true,
        data: {
          id: Number(id),
          title: `Casa ${id}`,
          ownerId: 1,
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
          media: [],
        },
      },
    }));
    propertyApi.getSimilar.mockResolvedValue({
      data: { success: true, data: [] },
    });
    propertyApi.getViewCount.mockImplementation((id) => new Promise((resolve) => {
      if (id === '123') {
        resolveFirstCount = resolve;
      } else {
        resolveSecondCount = resolve;
      }
    }));

    const { result, rerender } = renderHook(() => useShowProperty());

    await waitFor(() => {
      expect(propertyApi.getViewCount).toHaveBeenCalledWith('123');
    });

    mockedPropertyId = '456';
    rerender();

    await waitFor(() => {
      expect(propertyApi.getViewCount).toHaveBeenCalledWith('456');
    });

    resolveFirstCount({
      data: { success: true, data: 3 },
    });
    resolveSecondCount({
      data: { success: true, data: 9 },
    });

    await waitFor(() => {
      expect(result.current.viewCount).toBe(9);
    });
  });
});
