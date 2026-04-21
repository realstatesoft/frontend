import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('../../hooks/useAuth');
vi.mock('../../hooks/useHasPublishedProperties');
vi.mock('../../hooks/useMessagesData');
vi.mock('../../assets/Logotipo.png', () => ({ default: 'logotipo.png' }));

import { useAuth } from '../../hooks/useAuth';
import useHasPublishedProperties from '../../hooks/useHasPublishedProperties';
import { useUnreadMessagesCount } from '../../hooks/useMessagesData';
import CustomNavbar from '../../components/Landing/Navbar';

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <CustomNavbar />
    </MemoryRouter>
  );

describe('CustomNavbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usuario no autenticado', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        logout: vi.fn(),
      });
      useHasPublishedProperties.mockReturnValue(false);
      useUnreadMessagesCount.mockReturnValue({ data: 0 });
    });

    it('renderiza el botón "Contactanos"', () => {
      renderNavbar();
      expect(screen.getByText('Contactanos')).toBeInTheDocument();
    });

    it('muestra los enlaces de navegación principales', () => {
      renderNavbar();
      expect(screen.getByText('Inicio')).toBeInTheDocument();
      expect(screen.getByText('Propiedades')).toBeInTheDocument();
      expect(screen.getByText('Vender / Alquilar')).toBeInTheDocument();
    });

    it('muestra "Iniciar sesión" en el dropdown al abrir el menú de perfil', () => {
      renderNavbar();
      const profileBtn = screen.getByRole('button', { name: /menu de perfil/i });
      fireEvent.click(profileBtn);
      expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
    });

    it('no muestra el botón "Contactanos" cuando está autenticado', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: { email: 'test@test.com', role: 'USER', userId: 1 },
        logout: vi.fn(),
      });
      renderNavbar();
      expect(screen.queryByText('Contactanos')).not.toBeInTheDocument();
    });
  });

  describe('usuario autenticado', () => {
    const mockLogout = vi.fn();

    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: { email: 'user@example.com', role: 'USER', userId: 42 },
        logout: mockLogout,
      });
      useHasPublishedProperties.mockReturnValue(false);
      useUnreadMessagesCount.mockReturnValue({ data: 0 });
    });

    it('muestra las opciones del menú de perfil autenticado', () => {
      renderNavbar();
      const profileBtn = screen.getByRole('button', { name: /menu de perfil/i });
      fireEvent.click(profileBtn);

      expect(screen.getByText(/mi perfil/i)).toBeInTheDocument();
      expect(screen.getByText(/mis propiedades/i)).toBeInTheDocument();
      expect(screen.getByText(/cerrar sesión/i)).toBeInTheDocument();
    });

    it('no muestra "Ver Dashboard" para rol USER', () => {
      renderNavbar();
      const profileBtn = screen.getByRole('button', { name: /menu de perfil/i });
      fireEvent.click(profileBtn);
      expect(screen.queryByText(/ver dashboard/i)).not.toBeInTheDocument();
    });

    it('muestra "Ver Dashboard" para rol AGENT', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: { email: 'agent@example.com', role: 'AGENT', userId: 99 },
        logout: mockLogout,
      });
      useHasPublishedProperties.mockReturnValue(false);
      renderNavbar();
      const profileBtn = screen.getByRole('button', { name: /menu de perfil/i });
      fireEvent.click(profileBtn);
      expect(screen.getByText(/ver dashboard/i)).toBeInTheDocument();
    });

    it('muestra "Reservas recibidas" si tiene propiedades publicadas y es OWNER', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: { email: 'owner@example.com', role: 'OWNER', userId: 42 },
        logout: mockLogout,
      });
      useHasPublishedProperties.mockReturnValue(true);
      renderNavbar();
      const profileBtn = screen.getByRole('button', { name: /menu de perfil/i });
      fireEvent.click(profileBtn);
      expect(screen.getByText(/reservas recibidas/i)).toBeInTheDocument();
    });

    it('no muestra "Reservas recibidas" si no tiene propiedades publicadas', () => {
      useHasPublishedProperties.mockReturnValue(false);
      renderNavbar();
      const profileBtn = screen.getByRole('button', { name: /menu de perfil/i });
      fireEvent.click(profileBtn);
      expect(screen.queryByText(/reservas recibidas/i)).not.toBeInTheDocument();
    });

    it('no muestra "Reservas recibidas" si es USER aunque tenga propiedades publicadas', () => {
      useHasPublishedProperties.mockReturnValue(true);
      renderNavbar();
      const profileBtn = screen.getByRole('button', { name: /menu de perfil/i });
      fireEvent.click(profileBtn);
      expect(screen.queryByText(/reservas recibidas/i)).not.toBeInTheDocument();
    });

    it('llama a logout al hacer clic en "Cerrar sesión"', () => {
      renderNavbar();
      const profileBtn = screen.getByRole('button', { name: /menu de perfil/i });
      fireEvent.click(profileBtn);
      fireEvent.click(screen.getByText(/cerrar sesión/i));
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('cierra el dropdown al hacer clic fuera', () => {
      renderNavbar();
      const profileBtn = screen.getByRole('button', { name: /menu de perfil/i });
      fireEvent.click(profileBtn);
      expect(screen.getByText(/mi perfil/i)).toBeInTheDocument();
      fireEvent.mouseDown(document.body);
      expect(screen.queryByText(/mi perfil/i)).not.toBeInTheDocument();
    });
  });
});
