import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('../../hooks/useAuth');
import { useAuth } from '../../hooks/useAuth';
// Importamos el ProtectedRoute activo (el que usa AppRouter)
import ProtectedRoute from '../../components/auth/ProtectedRoute';

// ── Helpers ───────────────────────────────────────────────────────────────────
function SecretPage()  { return <div>Contenido protegido</div>; }
function AgentPage()   { return <div>Panel de Agente</div>; }
function HomePage()    { return <div>Inicio</div>; }
function LoginPage()   { return <div>Página de Login</div>; }

/**
 * Renderiza ProtectedRoute como wrapper de <Route> (patrón Outlet).
 */
function renderAsOutlet({
  isAuthenticated,
  user = null,
  requiredRole,
  path = '/secret',
  initialPath = '/secret',
  PageComponent = SecretPage,
}) {
  useAuth.mockReturnValue({ isAuthenticated, user });

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<ProtectedRoute requiredRole={requiredRole} />}>
          <Route path={path} element={<PageComponent />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/"      element={<HomePage />} />
      </Routes>
    </MemoryRouter>
  );
}

/**
 * Renderiza ProtectedRoute con children explícitos (patrón rutas Admin).
 */
function renderWithChildren({ isAuthenticated, user = null, requiredRole }) {
  useAuth.mockReturnValue({ isAuthenticated, user });

  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole={requiredRole}>
              <div>Panel de Admin</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/"      element={<HomePage />} />
      </Routes>
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('ProtectedRoute (components/auth)', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Autenticación básica ───────────────────────────────────────────────────
  describe('sin requiredRole', () => {
    it('renderiza el Outlet cuando el usuario está autenticado', () => {
      renderAsOutlet({ isAuthenticated: true });
      expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
    });

    it('redirige a /login cuando el usuario NO está autenticado', () => {
      renderAsOutlet({ isAuthenticated: false });
      expect(screen.getByText('Página de Login')).toBeInTheDocument();
      expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
    });

    it('no muestra contenido protegido al visitante anónimo', () => {
      renderAsOutlet({ isAuthenticated: false });
      expect(screen.queryByText('Contenido protegido')).toBeNull();
    });

    it('permite acceso a múltiples rutas anidadas cuando está autenticado', () => {
      useAuth.mockReturnValue({ isAuthenticated: true, user: null });
      render(
        <MemoryRouter initialEntries={['/secret']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/secret" element={<SecretPage />} />
              <Route path="/agent"  element={<AgentPage />} />
            </Route>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
    });
  });

  // ── Control por rol ────────────────────────────────────────────────────────
  describe('con requiredRole', () => {
    it('permite el acceso cuando el usuario tiene el rol requerido (AGENT)', () => {
      renderAsOutlet({
        isAuthenticated: true,
        user: { role: 'AGENT' },
        requiredRole: 'AGENT',
        path: '/agent',
        initialPath: '/agent',
        PageComponent: AgentPage,
      });
      expect(screen.getByText('Panel de Agente')).toBeInTheDocument();
    });

    it('redirige a / cuando el usuario NO tiene el rol requerido', () => {
      renderAsOutlet({
        isAuthenticated: true,
        user: { role: 'USER' },
        requiredRole: 'AGENT',
        path: '/agent',
        initialPath: '/agent',
        PageComponent: AgentPage,
      });
      expect(screen.queryByText('Panel de Agente')).not.toBeInTheDocument();
      expect(screen.getByText('Inicio')).toBeInTheDocument();
    });

    it('la comparación de roles es case-insensitive', () => {
      renderAsOutlet({
        isAuthenticated: true,
        user: { role: 'agent' },  // minúscula
        requiredRole: 'AGENT',    // mayúscula
        path: '/agent',
        initialPath: '/agent',
        PageComponent: AgentPage,
      });
      expect(screen.getByText('Panel de Agente')).toBeInTheDocument();
    });

    it('redirige a /login antes de chequear el rol si no está autenticado', () => {
      renderAsOutlet({
        isAuthenticated: false,
        user: null,
        requiredRole: 'AGENT',
        path: '/agent',
        initialPath: '/agent',
        PageComponent: AgentPage,
      });
      expect(screen.getByText('Página de Login')).toBeInTheDocument();
      expect(screen.queryByText('Panel de Agente')).not.toBeInTheDocument();
    });
  });

  // ── Modo children explícitos ───────────────────────────────────────────────
  describe('con children explícitos', () => {
    it('renderiza children cuando está autenticado y tiene el rol correcto', () => {
      renderWithChildren({
        isAuthenticated: true,
        user: { role: 'ADMIN' },
        requiredRole: 'ADMIN',
      });
      expect(screen.getByText('Panel de Admin')).toBeInTheDocument();
    });

    it('NO renderiza children si el usuario no está autenticado', () => {
      renderWithChildren({
        isAuthenticated: false,
        user: null,
        requiredRole: 'ADMIN',
      });
      expect(screen.queryByText('Panel de Admin')).not.toBeInTheDocument();
      expect(screen.getByText('Página de Login')).toBeInTheDocument();
    });

    it('NO renderiza children si el rol es incorrecto', () => {
      renderWithChildren({
        isAuthenticated: true,
        user: { role: 'USER' },
        requiredRole: 'ADMIN',
      });
      expect(screen.queryByText('Panel de Admin')).not.toBeInTheDocument();
      expect(screen.getByText('Inicio')).toBeInTheDocument();
    });
  });
});
