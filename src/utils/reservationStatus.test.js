import { describe, it, expect } from 'vitest';
import { statusVariant, statusLabel } from './reservationStatus';

describe('statusVariant', () => {
  it.each([
    ['PENDING',               'warning'],
    ['ACTIVE',                'success'],
    ['CANCELLED',             'secondary'],
    ['EXPIRED',               'dark'],
    ['CONVERTED_TO_CONTRACT', 'info'],
  ])('%s → %s', (status, expected) => {
    expect(statusVariant(status)).toBe(expected);
  });

  it('devuelve secondary para estado desconocido', () => {
    expect(statusVariant('UNKNOWN')).toBe('secondary');
  });
});

describe('statusLabel', () => {
  it.each([
    ['PENDING',               'Pendiente'],
    ['ACTIVE',                'Activa'],
    ['CANCELLED',             'Cancelada'],
    ['EXPIRED',               'Expirada'],
    ['CONVERTED_TO_CONTRACT', 'Convertida a contrato'],
  ])('%s → %s', (status, expected) => {
    expect(statusLabel(status)).toBe(expected);
  });

  it('devuelve el status crudo para estado desconocido', () => {
    expect(statusLabel('UNKNOWN')).toBe('UNKNOWN');
  });
});
