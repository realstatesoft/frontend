import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatCard from '../../../components/common/StatCard/StatCard';

const renderCard = (props = {}) =>
  render(<StatCard label="Clientes Activos" value={42} {...props} />);

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('StatCard', () => {
  describe('contenido básico', () => {
    it('muestra la etiqueta correctamente', () => {
      renderCard({ label: 'Ventas del Mes', value: 5 });
      expect(screen.getByText('Ventas del Mes')).toBeInTheDocument();
    });

    it('muestra el valor numérico', () => {
      renderCard({ value: 99 });
      expect(screen.getByText('99')).toBeInTheDocument();
    });

    it('muestra el valor como string (moneda)', () => {
      renderCard({ value: '$150,000' });
      expect(screen.getByText('$150,000')).toBeInTheDocument();
    });

    it('muestra el subtítulo cuando se provee', () => {
      renderCard({ subtitle: 'Este mes' });
      expect(screen.getByText('Este mes')).toBeInTheDocument();
    });

    it('no muestra subtítulo si no se pasa', () => {
      renderCard();
      expect(screen.queryByText('Este mes')).not.toBeInTheDocument();
    });

    it('muestra el hint cuando se provee', () => {
      renderCard({ hint: 'Comparado con el mes anterior' });
      expect(screen.getByText('Comparado con el mes anterior')).toBeInTheDocument();
    });
  });

  describe('indicador de tendencia', () => {
    it('muestra flecha arriba (↑) con trend positivo', () => {
      renderCard({ trend: 10 });
      expect(screen.getByText(/↑/)).toBeInTheDocument();
      expect(screen.getByText(/10%/)).toBeInTheDocument();
    });

    it('muestra flecha abajo (↓) con trend negativo', () => {
      renderCard({ trend: -5 });
      expect(screen.getByText(/↓/)).toBeInTheDocument();
      expect(screen.getByText(/5%/)).toBeInTheDocument();
    });

    it('muestra flecha neutral (→) con trend cero', () => {
      renderCard({ trend: 0 });
      expect(screen.getByText(/→/)).toBeInTheDocument();
    });

    it('no muestra tendencia cuando trend es undefined', () => {
      renderCard({ trend: undefined });
      expect(screen.queryByText(/↑|↓|→/)).not.toBeInTheDocument();
    });

    it('no muestra tendencia cuando trend es null', () => {
      renderCard({ trend: null });
      expect(screen.queryByText(/↑|↓|→/)).not.toBeInTheDocument();
    });

    it('redondea el porcentaje de tendencia a 2 decimales', () => {
      renderCard({ trend: 3.14159 });
      expect(screen.getByText(/3\.14%/)).toBeInTheDocument();
    });

    it('muestra el valor absoluto aunque trend sea negativo', () => {
      renderCard({ trend: -7.5 });
      expect(screen.getByText(/7\.5%/)).toBeInTheDocument();
    });
  });

  describe('ícono', () => {
    it('renderiza el ícono cuando se pasa', () => {
      renderCard({ icon: <svg data-testid="test-icon" /> });
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('no falla cuando no se pasa ícono', () => {
      expect(() => renderCard({ icon: undefined })).not.toThrow();
    });
  });
});
