import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('../../services/clients/clientApi');
vi.mock('../../hooks/useAuth');

// Mocks de subcomponentes pesados para aislar el componente bajo test
vi.mock('../../components/Landing/Navbar',   () => ({ default: () => <nav data-testid="navbar" /> }));
vi.mock('../../components/Landing/Footer',   () => ({ default: () => <footer data-testid="footer" /> }));
vi.mock('../../components/Clients/ProfileHeader',  () => ({
  default: ({ client }) => <div data-testid="profile-header">{client?.userName || client?.name}</div>,
}));
vi.mock('../../components/Clients/ProfileStats',   () => ({
  default: ({ client }) => <div data-testid="profile-stats">{client?.userName}</div>,
}));
vi.mock('../../components/Clients/ProfileDetails', () => ({
  default: ({ client }) => <div data-testid="profile-details">{client?.userEmail}</div>,
}));

import clientApi from '../../services/clients/clientApi';
import { useAuth } from '../../hooks/useAuth';
import ClientProfilePage from '../../pages/ClientProfilePage';

// ── Helper ────────────────────────────────────────────────────────────────────
function renderPage(id = '1', type = '') {
  const search = type ? `?type=${type}` : '';
  return render(
    <MemoryRouter initialEntries={[`/clients/${id}${search}`]}>
      <Routes>
        <Route path="/clients/:id" element={<ClientProfilePage />} />
        <Route path="/404" element={<div>Página 404</div>} />
      </Routes>
    </MemoryRouter>
  );
}

const internalClient = {
  id: 1,
  userName: 'Juan Pérez',
  userEmail: 'juan@example.com',
  userPhone: '123456789',
};

const externalClient = {
  id: 2,
  name: 'María García',
  email: 'maria@example.com',
  phone: '987654321',
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('ClientProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { role: 'AGENT' }, isAuthenticated: true });
  });

  // ── Cliente interno (AGENT) ────────────────────────────────────────────────
  describe('cliente interno (type=AGENT o sin type)', () => {
    it('llama a getClientProfile con el id correcto', async () => {
      clientApi.getClientProfile = vi.fn().mockResolvedValue(internalClient);

      renderPage('1', 'AGENT');

      await waitFor(() =>
        expect(clientApi.getClientProfile).toHaveBeenCalledWith('1')
      );
    });

    it('renderiza el nombre del cliente tras la carga', async () => {
      clientApi.getClientProfile = vi.fn().mockResolvedValue(internalClient);

      renderPage('1', 'AGENT');

      await waitFor(() =>
        expect(screen.getByTestId('profile-header')).toHaveTextContent('Juan Pérez')
      );
    });

    it('renderiza el email del cliente en ProfileDetails', async () => {
      clientApi.getClientProfile = vi.fn().mockResolvedValue(internalClient);

      renderPage('1', 'AGENT');

      await waitFor(() =>
        expect(screen.getByTestId('profile-details')).toHaveTextContent('juan@example.com')
      );
    });

    it('muestra spinner durante la carga', () => {
      // La promesa no resuelve aún
      clientApi.getClientProfile = vi.fn(() => new Promise(() => {}));

      renderPage('1', 'AGENT');

      // react-bootstrap Spinner renderiza con class spinner-border, sin role="status"
      expect(document.querySelector('.spinner-border')).toBeTruthy();
    });
  });

  // ── Cliente externo ────────────────────────────────────────────────────────
  describe('cliente externo (type=EXTERNAL)', () => {
    it('llama a getExternalClientProfile con el id correcto', async () => {
      clientApi.getExternalClientProfile = vi.fn().mockResolvedValue(externalClient);

      renderPage('2', 'EXTERNAL');

      await waitFor(() =>
        expect(clientApi.getExternalClientProfile).toHaveBeenCalledWith('2')
      );
    });

    it('normaliza los datos externos (name → userName, email → userEmail)', async () => {
      clientApi.getExternalClientProfile = vi.fn().mockResolvedValue(externalClient);

      renderPage('2', 'EXTERNAL');

      await waitFor(() =>
        expect(screen.getByTestId('profile-header')).toHaveTextContent('María García')
      );
      expect(screen.getByTestId('profile-details')).toHaveTextContent('maria@example.com');
    });

    it('NO llama a getClientProfile para clientes externos', async () => {
      clientApi.getExternalClientProfile = vi.fn().mockResolvedValue(externalClient);
      clientApi.getClientProfile = vi.fn();

      renderPage('2', 'EXTERNAL');

      await waitFor(() =>
        expect(clientApi.getExternalClientProfile).toHaveBeenCalled()
      );
      expect(clientApi.getClientProfile).not.toHaveBeenCalled();
    });
  });

  // ── Errores ────────────────────────────────────────────────────────────────
  describe('manejo de errores', () => {
    it('redirige a /404 cuando la API responde con 404', async () => {
      const err = { response: { status: 404 } };
      clientApi.getClientProfile = vi.fn().mockRejectedValue(err);

      renderPage('99', 'AGENT');

      await waitFor(() =>
        expect(screen.getByText('Página 404')).toBeInTheDocument()
      );
    });

    it('redirige a /404 cuando la API responde con 403', async () => {
      const err = { response: { status: 403 } };
      clientApi.getClientProfile = vi.fn().mockRejectedValue(err);

      renderPage('99', 'AGENT');

      await waitFor(() =>
        expect(screen.getByText('Página 404')).toBeInTheDocument()
      );
    });

    it('muestra alerta de error genérico para errores que no son 404/403/401', async () => {
      const err = { response: { status: 500 } };
      clientApi.getClientProfile = vi.fn().mockRejectedValue(err);

      renderPage('1', 'AGENT');

      await waitFor(() =>
        expect(
          screen.getByText(/no se pudo cargar el perfil del cliente/i)
        ).toBeInTheDocument()
      );
    });

    it('NO muestra error genérico para errores 401 (manejados globalmente)', async () => {
      const err = { response: { status: 401 } };
      clientApi.getClientProfile = vi.fn().mockRejectedValue(err);

      renderPage('1', 'AGENT');

      // Esperar a que el spinner desaparezca usando el mismo selector que el resto del spec:
      // react-bootstrap Spinner renderiza con class spinner-border, sin role="status"
      await waitFor(() =>
        expect(document.querySelector('.spinner-border')).toBeNull()
      );
      expect(
        screen.queryByText(/no se pudo cargar el perfil del cliente/i)
      ).not.toBeInTheDocument();
    });
  });
});
