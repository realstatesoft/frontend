import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('../../hooks/useAuth');
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../../routes/ProtectedRoute';

// Componente auxiliar que representa el contenido protegido
function SecretPage() {
  return <div>Contenido protegido</div>;
}

function renderWithRouter(initialPath = '/secret', isAuthenticated = false) {
  useAuth.mockReturnValue({ isAuthenticated });

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/secret" element={<SecretPage />} />
        </Route>
        <Route path="/login" element={<div>Página de Login</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el contenido protegido cuando el usuario está autenticado', () => {
    renderWithRouter('/secret', true);
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('redirige a /login cuando el usuario no está autenticado', () => {
    renderWithRouter('/secret', false);
    expect(screen.getByText('Página de Login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('no muestra el contenido protegido al visitante', () => {
    renderWithRouter('/secret', false);
    expect(screen.queryByText('Contenido protegido')).toBeNull();
  });

  it('permite acceso a múltiples rutas protegidas cuando está autenticado', () => {
    useAuth.mockReturnValue({ isAuthenticated: true });

    render(
      <MemoryRouter initialEntries={['/secret']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/secret" element={<div>Ruta A</div>} />
            <Route path="/otra" element={<div>Ruta B</div>} />
          </Route>
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Ruta A')).toBeInTheDocument();
  });
});
