import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { i18n, initializeI18n } from '../../../i18n';

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../../../hooks/useAgentStats');
import useAgentStats from '../../../hooks/useAgentStats';

vi.mock('../../../components/widgets/QuickActions/QuickActions', () => ({
  default: () => <div data-testid="quick-actions">QuickActions</div>,
}));
vi.mock('../../../components/widgets/SalesPerformanceChart/SalesPerformanceChart', () => ({
  default: () => <div data-testid="sales-chart">SalesPerformanceChart</div>,
}));
vi.mock('../../../components/widgets/UpcomingAppointments/UpcomingAppointments', () => ({
  default: () => <div data-testid="upcoming-appointments">UpcomingAppointments</div>,
}));

import DashboardPage from '../../../pages/Dashboard/DashboardPage';

const renderDashboard = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </I18nextProvider>
  );

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(async () => {
    await initializeI18n();
  });

  describe('encabezado', () => {
    beforeEach(() => {
      useAgentStats.mockReturnValue({ data: undefined });
    });

    it('muestra el título "Dashboard"', () => {
      renderDashboard();
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });

    it('muestra el subtítulo de resumen', () => {
      renderDashboard();
      expect(screen.getByText(/resumen de tu actividad/i)).toBeInTheDocument();
    });
  });

  describe('stat cards — sin datos', () => {
    beforeEach(() => {
      useAgentStats.mockReturnValue({ data: undefined });
    });

    it('muestra la tarjeta "Clientes Activos" con valor 0', () => {
      renderDashboard();
      expect(screen.getByText('Clientes Activos')).toBeInTheDocument();
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    });

    it('muestra la tarjeta "Ventas del Mes"', () => {
      renderDashboard();
      expect(screen.getByText('Ventas del Mes')).toBeInTheDocument();
    });

    it('muestra la tarjeta "Visitas Programadas"', () => {
      renderDashboard();
      expect(screen.getByText('Visitas Programadas')).toBeInTheDocument();
    });

    it('muestra la tarjeta "Comisiones" con $0 por defecto', () => {
      renderDashboard();
      expect(screen.getByText('Comisiones')).toBeInTheDocument();
      expect(screen.getByText('$0')).toBeInTheDocument();
    });
  });

  describe('stat cards — con datos del hook', () => {
    beforeEach(() => {
      useAgentStats.mockReturnValue({
        data: {
          data: {
            activeClients: { value: 12, trend: 5 },
            totalSales: { value: 3, trend: -2 },
            scheduledVisits: { value: 7, trend: 0 },
            commissions: { value: 150000, trend: 10 },
          },
        },
      });
    });

    it('muestra el valor de clientes activos', () => {
      renderDashboard();
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('muestra el valor de ventas del mes', () => {
      renderDashboard();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('muestra el valor de visitas programadas', () => {
      renderDashboard();
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('formatea las comisiones como moneda', () => {
      renderDashboard();
      // formatCurrency uses Intl.NumberFormat es-MX MXN
      expect(screen.getByText(/150/)).toBeInTheDocument();
    });
  });

  describe('widgets', () => {
    beforeEach(() => {
      useAgentStats.mockReturnValue({ data: undefined });
    });

    it('renderiza el widget QuickActions', () => {
      renderDashboard();
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    });

    it('renderiza el gráfico de rendimiento de ventas', () => {
      renderDashboard();
      expect(screen.getByTestId('sales-chart')).toBeInTheDocument();
    });

    it('renderiza las próximas citas', () => {
      renderDashboard();
      expect(screen.getByTestId('upcoming-appointments')).toBeInTheDocument();
    });
  });
});
