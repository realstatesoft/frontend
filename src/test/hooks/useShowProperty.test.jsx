import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const mockedNavigate = vi.fn();

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
  },
}));

vi.mock('../../services/propertyFlagsApi', () => ({
  default: {
    getActiveFlagCount: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '123' }),
    useNavigate: () => mockedNavigate,
  };
});

import { useAuth } from '../../hooks/useAuth';
import propertyApi from '../../services/properties/propertyApi';
import propertyFlagsApi from '../../services/propertyFlagsApi';
import { useShowProperty } from '../../hooks/useShowProperty';

describe('useShowProperty', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('no rompe la carga si falla el registro o el conteo de vistas', async () => {
    propertyApi.registerView.mockRejectedValue(new Error('register failed'));
    propertyApi.getViewCount.mockRejectedValue(new Error('count failed'));

    const { result } = renderHook(() => useShowProperty());

    await waitFor(() => {
      expect(propertyApi.registerView).toHaveBeenCalledTimes(1);
      expect(result.current.viewCount).toBeNull();
    });
  });
});
