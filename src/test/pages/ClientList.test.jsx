import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('../../hooks/useClients');
vi.mock('../../hooks/useAuth');
vi.mock('../../components/Landing/Navbar',              () => ({ default: () => <nav data-testid="navbar" /> }));
vi.mock('../../components/Landing/Footer',              () => ({ default: () => <footer data-testid="footer" /> }));
vi.mock('../../components/properties/Pagination',       () => ({ default: () => <div data-testid="pagination" /> }));
vi.mock('../../components/commons/ConfirmDialog',       () => ({ default: () => <div data-testid="confirm-dialog" /> }));
vi.mock('sweetalert2', () => ({ default: { fire: vi.fn().mockResolvedValue({ isConfirmed: false }) } }));

import useClients from '../../hooks/useClients';
import { useAuth } from '../../hooks/useAuth';
import ClientList from '../../pages/ClientList/ClientList';

// ── Datos de prueba ───────────────────────────────────────────────────────────
const makeClient = (overrides = {}) => ({
  id: 1,
  userName: 'Juan Pérez',
  userEmail: 'juan@example.com',
  userPhone: '123456789',
  internalType: 'AGENT',
  clientType: 'INDIVIDUAL',
  status: 'ACTIVE',
  createdAt: '2024-01-15T00:00:00Z',
  ...overrides,
});

const defaultHookState = {
  clients: [makeClient()],
  loading: false,
  error: null,
  page: 0,
  totalPages: 1,
  totalElements: 1,
  filters: { q: '', status: '', clientType: '', internalType: '', sort: 'createdAt,desc' },
  selectedIds: new Set(),
  handlePageChange: vi.fn(),
  updateFilters: vi.fn(),
  removeClient: vi.fn(),
  exportCsv: vi.fn(),
  toggleSelect: vi.fn(),
  selectAll: vi.fn(),
  clearSelection: vi.fn(),
  batchMarkInactive: vi.fn(),
};

// ── Helper ────────────────────────────────────────────────────────────────────
function renderClientList(hookOverrides = {}, userRole = 'AGENT') {
  useClients.mockReturnValue({ ...defaultHookState, ...hookOverrides });
  useAuth.mockReturnValue({ user: { role: userRole }, isAuthenticated: true });

  return render(
    <MemoryRouter>
      <ClientList />
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('ClientList', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Renderizado básico ─────────────────────────────────────────────────────
  it('renderiza el título "Mis Clientes"', () => {
    renderClientList();
    expect(screen.getByText('Mis Clientes')).toBeInTheDocument();
  });

  it('muestra el nombre del cliente en la tabla', () => {
    renderClientList();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
  });

  it('muestra spinner y mensaje mientras carga', () => {
    renderClientList({ loading: true, clients: [] });
    // react-bootstrap Spinner renderiza con class spinner-border, sin role="status"
    expect(document.querySelector('.spinner-border')).toBeTruthy();
    expect(screen.getByText(/cargando clientes/i)).toBeInTheDocument();
  });

  it('muestra mensaje vacío cuando no hay clientes', () => {
    renderClientList({ clients: [], totalElements: 0 });
    expect(
      screen.getByText(/no se encontraron clientes con los filtros actuales/i)
    ).toBeInTheDocument();
  });

  it('muestra alerta de error cuando el hook reporta error', () => {
    renderClientList({ error: 'No se pudo conectar' });
    expect(screen.getByText('No se pudo conectar')).toBeInTheDocument();
  });

  // ── Búsqueda ───────────────────────────────────────────────────────────────
  describe('búsqueda por texto', () => {
    it('llama a updateFilters con el texto al hacer submit del formulario', () => {
      const updateFilters = vi.fn();
      renderClientList({ updateFilters });

      const input = screen.getByPlaceholderText(/nombre, email/i);
      fireEvent.change(input, { target: { value: 'Ana' } });
      fireEvent.submit(input.closest('form'));

      expect(updateFilters).toHaveBeenCalledWith({ q: 'Ana' });
    });

    it('llama a updateFilters con q vacío al limpiar la búsqueda', () => {
      const updateFilters = vi.fn();
      renderClientList({
        updateFilters,
        filters: { ...defaultHookState.filters, q: 'prev' },
      });

      // El botón ✕ aparece cuando hay texto en el input
      const input = screen.getByPlaceholderText(/nombre, email/i);
      fireEvent.change(input, { target: { value: 'algo' } });

      const clearBtn = screen.getByText('✕');
      fireEvent.click(clearBtn);

      expect(updateFilters).toHaveBeenCalledWith({ q: '' });
    });
  });

  // ── Filtros ────────────────────────────────────────────────────────────────
  describe('filtros de la barra', () => {
    it('filtro por estado: seleccionar "Activo" llama updateFilters({ status: "ACTIVE" })', () => {
      const updateFilters = vi.fn();
      renderClientList({ updateFilters });

      // Hay 3 selects con opción "Todos": Estado (0), Origen (1), Tipo (2)
      const selects = screen.getAllByDisplayValue('Todos');
      fireEvent.change(selects[0], { target: { value: 'ACTIVE' } });

      expect(updateFilters).toHaveBeenCalledWith({ status: 'ACTIVE' });
    });

    it('filtro por origen: seleccionar "Externo" llama updateFilters({ internalType: "EXTERNAL" })', () => {
      const updateFilters = vi.fn();
      renderClientList({ updateFilters });

      const selects = screen.getAllByDisplayValue('Todos');
      fireEvent.change(selects[1], { target: { value: 'EXTERNAL' } });

      expect(updateFilters).toHaveBeenCalledWith({ internalType: 'EXTERNAL' });
    });

    it('filtro por tipo: seleccionar "Empresa" llama updateFilters({ clientType: "COMPANY" })', () => {
      const updateFilters = vi.fn();
      renderClientList({ updateFilters });

      const selects = screen.getAllByDisplayValue('Todos');
      fireEvent.change(selects[2], { target: { value: 'COMPANY' } });

      expect(updateFilters).toHaveBeenCalledWith({ clientType: 'COMPANY' });
    });
  });

  // ── Badges de origen ──────────────────────────────────────────────────────
  describe('badges de origen (internalType)', () => {
    it('muestra badge "Interno" para clientes AGENT', () => {
      renderClientList({ clients: [makeClient({ internalType: 'AGENT' })] });
      // "Interno" aparece tanto en el <option> del select como en el badge;
      // buscamos específicamente el span con clase badge.
      const badges = screen.getAllByText('Interno');
      const badge = badges.find(el => el.tagName === 'SPAN' && el.classList.contains('badge'));
      expect(badge).toBeTruthy();
    });

    it('muestra badge "Externo" para clientes EXTERNAL', () => {
      renderClientList({ clients: [makeClient({ internalType: 'EXTERNAL' })] });
      const badges = screen.getAllByText('Externo');
      const badge = badges.find(el => el.tagName === 'SPAN' && el.classList.contains('badge'));
      expect(badge).toBeTruthy();
    });
  });

  // ── Estado de cliente ──────────────────────────────────────────────────
  describe('badges de estado', () => {
    it('muestra "Activo" para clientes con status ACTIVE', () => {
      renderClientList({ clients: [makeClient({ status: 'ACTIVE' })] });
      // "Activo" también aparece en el <option> del select; buscamos el span.badge
      const matches = screen.getAllByText('Activo');
      const badge = matches.find(el => el.tagName === 'SPAN' && el.classList.contains('badge'));
      expect(badge).toBeTruthy();
    });

    it('muestra "Inactivo" para clientes con status INACTIVE', () => {
      renderClientList({ clients: [makeClient({ status: 'INACTIVE' })] });
      const matches = screen.getAllByText('Inactivo');
      const badge = matches.find(el => el.tagName === 'SPAN' && el.classList.contains('badge'));
      expect(badge).toBeTruthy();
    });
  });

  // ── Permisos ──────────────────────────────────────────────────────────────
  describe('control de permisos', () => {
    it('muestra botón "Exportar CSV" para rol AGENT', () => {
      renderClientList({}, 'AGENT');
      expect(screen.getByText(/exportar csv/i)).toBeInTheDocument();
    });

    it('NO muestra botón "Exportar CSV" para rol USER', () => {
      renderClientList({}, 'USER');
      expect(screen.queryByText(/exportar csv/i)).not.toBeInTheDocument();
    });
  });
});
