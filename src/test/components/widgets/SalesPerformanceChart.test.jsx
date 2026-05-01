import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { i18n, initializeI18n } from '../../../i18n';

vi.mock('../../../hooks/useSalesData');
import { useSalesSummary } from '../../../hooks/useSalesData';

vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');

  return {
    ...actual,
    ResponsiveContainer: ({ children }) => (
      <div data-testid="responsive-container" style={{ width: 800, height: 280 }}>
        {children}
      </div>
    ),
  };
});

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

import SalesPerformanceChart from '../../../components/widgets/SalesPerformanceChart/SalesPerformanceChart';

const renderChart = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <SalesPerformanceChart />
      </MemoryRouter>
    </I18nextProvider>
  );

describe('SalesPerformanceChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(async () => {
    await initializeI18n();
  });

  describe('encabezado', () => {
    beforeEach(() => {
      useSalesSummary.mockReturnValue({ data: undefined, isLoading: false });
    });

    it('muestra el título del gráfico', () => {
      renderChart();
      expect(screen.getByText('Rendimiento de Ventas')).toBeInTheDocument();
    });

    it('muestra el subtítulo del rango temporal', () => {
      renderChart();
      expect(screen.getByText(/ltimos 6 meses/i)).toBeInTheDocument();
    });
  });

  describe('estado de carga', () => {
    it('muestra "Cargando..." cuando isLoading es true', () => {
      useSalesSummary.mockReturnValue({ data: undefined, isLoading: true });
      renderChart();
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });
  });

  describe('con datos', () => {
    const mockMonthlyData = [
      { month: 'Nov', sales: 1200000 },
      { month: 'Dic', sales: 1800000 },
      { month: 'Ene', sales: 950000 },
      { month: 'Feb', sales: 2100000 },
      { month: 'Mar', sales: 1600000 },
      { month: 'Abr', sales: 2400000 },
    ];

    beforeEach(() => {
      useSalesSummary.mockReturnValue({
        data: { data: { monthlyData: mockMonthlyData } },
        isLoading: false,
      });
    });

    it('no muestra el estado de carga', () => {
      renderChart();
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    it('renderiza el componente sin errores con datos completos', () => {
      expect(() => renderChart()).not.toThrow();
    });
  });

  describe('sin datos', () => {
    beforeEach(() => {
      useSalesSummary.mockReturnValue({
        data: { data: { monthlyData: [] } },
        isLoading: false,
      });
    });

    it('renderiza sin errores cuando monthlyData está vacío', () => {
      expect(() => renderChart()).not.toThrow();
    });

    it('no muestra "Cargando..." cuando los datos son vacíos', () => {
      renderChart();
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });
  });
});
