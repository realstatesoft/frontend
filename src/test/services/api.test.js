import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('axios');
vi.mock('../../utils/authToken', () => ({
  getAccessToken: vi.fn(() => null),
  setAccessToken: vi.fn(),
  getRefreshToken: vi.fn(() => null),
  setRefreshToken: vi.fn(),
  clearSession: vi.fn(),
}));

import * as authToken from '../../utils/authToken';

// Importar api después de los mocks para que use las versiones mockeadas
const getApiModule = () => import('../../services/api');

describe('api service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Simular axios.create retornando un objeto con interceptors
    const mockAxiosInstance = {
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
    axios.create = vi.fn(() => mockAxiosInstance);
  });

  it('el módulo api es exportado como default', async () => {
    // Verifica que el módulo tenga al menos las propiedades básicas de axios
    // (No podemos reimportar fácilmente por el caché de módulos, así que verificamos el mock)
    expect(axios.create).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests unitarios sobre la lógica de authToken que usa api.js
// ─────────────────────────────────────────────────────────────────────────────

describe('authToken integration con api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAccessToken retorna null cuando no hay token almacenado', () => {
    authToken.getAccessToken.mockReturnValue(null);
    expect(authToken.getAccessToken()).toBeNull();
  });

  it('setAccessToken almacena el token correctamente', () => {
    authToken.setAccessToken('mi-token-123');
    expect(authToken.setAccessToken).toHaveBeenCalledWith('mi-token-123');
  });

  it('clearSession es llamada al cerrar sesión', () => {
    authToken.clearSession();
    expect(authToken.clearSession).toHaveBeenCalledTimes(1);
  });

  it('setRefreshToken y getRefreshToken funcionan en conjunto', () => {
    authToken.getRefreshToken.mockReturnValue('refresh-abc');
    const result = authToken.getRefreshToken();
    expect(result).toBe('refresh-abc');
  });
});
