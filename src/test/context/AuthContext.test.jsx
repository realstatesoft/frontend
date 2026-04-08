import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, renderHook } from '@testing-library/react';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from '../../context/AuthContext';

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('../../utils/authToken', () => ({
  getAccessToken: vi.fn(() => null),
  setAccessToken: vi.fn(),
  getRefreshToken: vi.fn(() => null),
  setRefreshToken: vi.fn(),
  getUserInfo: vi.fn(() => null),
  setUserInfo: vi.fn(),
  clearSession: vi.fn(),
  removeAccessToken: vi.fn(),
}));

import api from '../../services/api';
import * as authToken from '../../utils/authToken';

// Componente auxiliar para exponer el contexto en tests
function TestConsumer() {
  const ctx = useContext(AuthContext);
  return (
    <div>
      <span data-testid="isAuthenticated">{String(ctx.isAuthenticated)}</span>
      <span data-testid="user">{ctx.user ? ctx.user.email : 'null'}</span>
      <button onClick={() => ctx.login({
        accessToken: 'acc123',
        refreshToken: 'ref456',
        email: 'user@test.com',
        role: 'USER',
        id: 1,
      })}>login</button>
      <button onClick={() => ctx.logout()}>logout</button>
    </div>
  );
}

const renderProvider = () =>
  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authToken.getAccessToken.mockReturnValue(null);
    authToken.getUserInfo.mockReturnValue(null);
  });

  it('inicia sin autenticación cuando no hay token almacenado', () => {
    renderProvider();
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('autentica al usuario llamando a login()', async () => {
    renderProvider();
    await act(async () => {
      screen.getByText('login').click();
    });
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('user@test.com');
    expect(authToken.setAccessToken).toHaveBeenCalledWith('acc123');
    expect(authToken.setRefreshToken).toHaveBeenCalledWith('ref456');
  });

  it('lanza error si login recibe un accessToken inválido', () => {
    // Para probar lógica interna sin depender de UI, usamos renderHook
    const { result } = renderHook(() => useContext(AuthContext), {
      wrapper: AuthProvider
    });

    expect(() => result.current.login(null)).toThrow("login(): accessToken inválido");
    expect(() => result.current.login({})).toThrow("login(): accessToken inválido");
    expect(() => result.current.login({ accessToken: 123 })).toThrow("login(): accessToken inválido");
  });


  it('desautentica al usuario llamando a logout()', async () => {
    // Empezar con sesión activa
    authToken.getAccessToken.mockReturnValue('existing-token');
    authToken.getUserInfo.mockReturnValue({ email: 'user@test.com', role: 'USER', userId: 1 });
    api.post.mockResolvedValue({});

    renderProvider();
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');

    await act(async () => {
      screen.getByText('logout').click();
    });

    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
    expect(authToken.clearSession).toHaveBeenCalledTimes(1);
  });

  it('inicializa con sesión activa si hay token en authToken', () => {
    authToken.getAccessToken.mockReturnValue('stored-token');
    authToken.getUserInfo.mockReturnValue({ email: 'stored@test.com', role: 'ADMIN', userId: 7 });

    renderProvider();

    expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('stored@test.com');
  });
});
