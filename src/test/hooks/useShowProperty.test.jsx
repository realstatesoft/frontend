import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../services/properties/propertyApi', () => ({
  default: {
    getById: vi.fn(),
    getSimilar: vi.fn(),
    getViewCount: vi.fn(),
    registerView: vi.fn(),
    changeStatus: vi.fn(),
    update: vi.fn(),
    trash: vi.fn(),
  },
}));

vi.mock('../../services/propertyFlagsApi', () => ({
  default: {
    getActiveFlagCount: vi.fn(),
  },
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

import { useAuth } from '../../hooks/useAuth';
import propertyApi from '../../services/properties/propertyApi';
import propertyFlagsApi from '../../services/propertyFlagsApi';
import { useShowProperty } from '../../hooks/useShowProperty';

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/properties/10']}>
    <Routes>
      <Route path="/properties/:id" element={<>{children}</>} />
    </Routes>
  </MemoryRouter>
);

const baseProperty = {
  id: 10,
  title: 'Casa principal',
  ownerId: 1,
  viewCount: 2,
  media: [],
  status: 'PUBLISHED',
  visibility: 'PUBLIC',
  price: 100000,
  propertyType: 'HOUSE',
  address: 'Calle 1',
};

describe('useShowProperty', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });

    propertyApi.getById.mockResolvedValue({
      data: {
        success: true,
        data: baseProperty,
      },
    });
    propertyApi.getSimilar.mockResolvedValue({
      data: {
        success: true,
        data: [],
      },
    });
    propertyFlagsApi.getActiveFlagCount.mockResolvedValue(0);
  });

  it('registra la vista y usa el conteo devuelto por backend', async () => {
    propertyApi.getViewCount.mockRejectedValue(new Error('count failed'));
    propertyApi.registerView.mockResolvedValue({
      data: {
        success: true,
        data: 5,
      },
    });

    const { result } = renderHook(() => useShowProperty(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => expect(result.current.viewCount).toBe(5));

    expect(propertyApi.getViewCount).toHaveBeenCalledWith('10');
    expect(propertyApi.registerView).toHaveBeenCalledWith('10');
  });

  it('no se rompe si falla el registro y conserva el conteo consultado', async () => {
    propertyApi.getViewCount.mockResolvedValue({
      data: {
        success: true,
        data: 7,
      },
    });
    propertyApi.registerView.mockRejectedValue(new Error('register failed'));

    const { result } = renderHook(() => useShowProperty(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => expect(result.current.viewCount).toBe(7));

    expect(propertyApi.getViewCount).toHaveBeenCalledWith('10');
    expect(propertyApi.registerView).toHaveBeenCalledWith('10');
  });
});
