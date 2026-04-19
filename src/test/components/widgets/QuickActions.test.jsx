import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import QuickActions from '../../../components/widgets/QuickActions/QuickActions';

const renderQuickActions = () =>
  render(
    <MemoryRouter>
      <QuickActions />
    </MemoryRouter>
  );

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('QuickActions', () => {
  describe('título', () => {
    it('muestra el título "Acciones Rápidas"', () => {
      renderQuickActions();
      expect(screen.getByText('Acciones Rápidas')).toBeInTheDocument();
    });
  });

  describe('acciones disponibles', () => {
    it('muestra el botón "Nuevo Cliente"', () => {
      renderQuickActions();
      expect(screen.getByText('Nuevo Cliente')).toBeInTheDocument();
    });

    it('muestra el botón "Nueva Propiedad"', () => {
      renderQuickActions();
      expect(screen.getByText('Nueva Propiedad')).toBeInTheDocument();
    });

    it('muestra el botón "Agendar Visita"', () => {
      renderQuickActions();
      expect(screen.getByText('Agendar Visita')).toBeInTheDocument();
    });

    it('renderiza exactamente 4 acciones', () => {
      renderQuickActions();
      // Each action is a Link rendered as an anchor
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(4);
    });
  });

  describe('rutas de navegación', () => {
    it('el enlace "Nuevo Cliente" apunta a /clients/register', () => {
      renderQuickActions();
      const link = screen.getByRole('link', { name: /nuevo cliente/i });
      expect(link).toHaveAttribute('href', '/clients/register');
    });

    it('el enlace "Nueva Propiedad" apunta a /create-property', () => {
      renderQuickActions();
      const link = screen.getByRole('link', { name: /nueva propiedad/i });
      expect(link).toHaveAttribute('href', '/create-property');
    });

    it('el enlace "Agendar Visita" apunta a /agent/agenda', () => {
      renderQuickActions();
      const link = screen.getByRole('link', { name: /agendar visita/i });
      expect(link).toHaveAttribute('href', '/agent/agenda');
    });
  });
});
