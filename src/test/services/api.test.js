import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import api from '../../services/api';
import * as authToken from '../../utils/authToken';

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    default: {
      ...actual.default,
      post: vi.fn()
    }
  };
});

vi.mock('../../utils/authToken', () => ({
  getAccessToken: vi.fn(),
  setAccessToken: vi.fn(),
  getRefreshToken: vi.fn(),
  setRefreshToken: vi.fn(),
  clearSession: vi.fn()
}));

describe('api service integration with interceptors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adjunta el token en la cabecera de las peticiones (request interceptor)', () => {
    authToken.getAccessToken.mockReturnValue('mi-token-xyz');
    
    // Accedemos directamente a los handlers del interceptor
    const requestInterceptor = api.interceptors.request.handlers[0].fulfilled;
    
    const config = { headers: {} };
    const modifiedConfig = requestInterceptor(config);
    
    expect(modifiedConfig.headers.Authorization).toBe('Bearer mi-token-xyz');
  });

  it('no adjunta token si getAccessToken() es null', () => {
    authToken.getAccessToken.mockReturnValue(null);
    const requestInterceptor = api.interceptors.request.handlers[0].fulfilled;
    
    const config = { headers: {} };
    const modifiedConfig = requestInterceptor(config);
    
    expect(modifiedConfig.headers.Authorization).toBeUndefined();
  });

  it('maneja el refresco de token en caso de 401 (response interceptor)', async () => {
    const responseInterceptorError = api.interceptors.response.handlers[0].rejected;
    
    const originalRequest = { 
        url: '/test',
        headers: {},
        _retry: false 
    };
    
    const errorResponse = {
        response: { status: 401 },
        config: originalRequest
    };

    authToken.getRefreshToken.mockReturnValue('refresh-123');
    
    // Simular éxito del refresco de token
    axios.post.mockResolvedValue({
        data: {
            data: {
                accessToken: 'nuevo-token',
                refreshToken: 'nuevo-refresh'
            }
        }
    });

    // Simulamos la ejecución del interceptor (que es asíncrono)
    try {
        await responseInterceptorError(errorResponse);
    } catch (e) {
        // Ignoramos el error del reintento final
    }
    
    expect(authToken.setAccessToken).toHaveBeenCalledWith('nuevo-token');
    expect(authToken.setRefreshToken).toHaveBeenCalledWith('nuevo-refresh');
    expect(originalRequest._retry).toBe(true);
  });

  it('no refresca token si no hay refreshToken presente', async () => {
    const responseInterceptorError = api.interceptors.response.handlers[0].rejected;
    authToken.getRefreshToken.mockReturnValue(null);
    
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '', pathname: '/dashboard' };

    const errorResponse = {
        response: { status: 401 },
        config: { url: '/test' }
    };

    try {
        await responseInterceptorError(errorResponse);
    } catch (e) {
        // Debería rechazar
    }

    expect(authToken.clearSession).toHaveBeenCalled();
    expect(window.location.href).toContain('/login');
    
    window.location = originalLocation;
  });
});
