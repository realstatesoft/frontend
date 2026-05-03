import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { i18n, initializeI18n } from '../../../i18n';

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../../../hooks/useAppointments');
import useAppointments from '../../../hooks/useAppointments';

import UpcomingAppointments from '../../../components/widgets/UpcomingAppointments/UpcomingAppointments';

const renderWidget = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <UpcomingAppointments />
      </MemoryRouter>
    </I18nextProvider>
  );

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('UpcomingAppointments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(async () => {
    await initializeI18n();
  });

  describe('estado de carga', () => {
    it('muestra "Cargando..." mientras isLoading es true', () => {
      useAppointments.mockReturnValue({ data: undefined, isLoading: true });
      renderWidget();
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('muestra el título incluso durante la carga', () => {
      useAppointments.mockReturnValue({ data: undefined, isLoading: true });
      renderWidget();
      expect(screen.getByText('Próximas Citas')).toBeInTheDocument();
    });
  });

  describe('estado vacío', () => {
    beforeEach(() => {
      useAppointments.mockReturnValue({ data: { data: [] }, isLoading: false });
    });

    it('muestra el título "Próximas Citas"', () => {
      renderWidget();
      expect(screen.getByText('Próximas Citas')).toBeInTheDocument();
    });

    it('muestra mensaje cuando no hay citas', () => {
      renderWidget();
      expect(screen.getByText('No hay citas programadas')).toBeInTheDocument();
    });
  });

  describe('con citas', () => {
    const mockAppointments = [
      {
        id: 1,
        title: 'Visita Calle Palmas',
        clientName: 'Ana García',
        date: '2026-04-15T10:00:00',
        type: 'visit',
      },
      {
        id: 2,
        title: 'Reunión de contrato',
        clientName: 'Luis Martínez',
        date: '2026-04-16T14:30:00',
        type: 'meeting',
      },
    ];

    beforeEach(() => {
      useAppointments.mockReturnValue({
        data: { data: mockAppointments },
        isLoading: false,
      });
    });

    it('muestra el título de cada cita', () => {
      renderWidget();
      expect(screen.getByText('Visita Calle Palmas')).toBeInTheDocument();
      expect(screen.getByText('Reunión de contrato')).toBeInTheDocument();
    });

    it('muestra el nombre del cliente de cada cita', () => {
      renderWidget();
      expect(screen.getByText('Ana García')).toBeInTheDocument();
      expect(screen.getByText('Luis Martínez')).toBeInTheDocument();
    });

    it('no muestra el mensaje de vacío cuando hay citas', () => {
      renderWidget();
      expect(screen.queryByText('No hay citas programadas')).not.toBeInTheDocument();
    });
  });

  describe('límite de visualización', () => {
    it('muestra máximo 5 citas aunque haya más', () => {
      const many = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Cita ${i + 1}`,
        clientName: `Cliente ${i + 1}`,
        date: '2026-04-20T09:00:00',
        type: 'visit',
      }));
      useAppointments.mockReturnValue({ data: { data: many }, isLoading: false });
      renderWidget();
      // Only the first 5 titles should appear
      expect(screen.getByText('Cita 1')).toBeInTheDocument();
      expect(screen.getByText('Cita 5')).toBeInTheDocument();
      expect(screen.queryByText('Cita 6')).not.toBeInTheDocument();
    });
  });
});
