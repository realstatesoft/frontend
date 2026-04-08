import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatDateTime, formatTime, formatPercentage } from '../../utils/formatters';
import { formatPrice, parsePriceInput } from '../../utils/priceFormat';

// ─────────────────────────────────────────────────────────────────────────────
// formatters.js
// ─────────────────────────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formatea un número a moneda MXN', () => {
    const result = formatCurrency(1500000);
    expect(result).toContain('1');
    expect(result).toContain('500');
  });

  it('retorna $0 cuando el valor es null', () => {
    expect(formatCurrency(null)).toBe('$0');
  });

  it('retorna $0 cuando el valor es undefined', () => {
    expect(formatCurrency(undefined)).toBe('$0');
  });

  it('formatea 0 correctamente', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });
});

describe('formatDate', () => {
  it('retorna string vacío para valor falsy', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  it('formatea una fecha ISO válida', () => {
    const result = formatDate('2024-06-15T00:00:00Z');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});

describe('formatDateTime', () => {
  it('retorna string vacío para valor falsy', () => {
    expect(formatDateTime('')).toBe('');
  });

  it('formatea una fecha-hora ISO válida con hora', () => {
    const result = formatDateTime('2024-06-15T10:30:00Z');
    expect(result).toBeTruthy();
    // Debe contener algún separador de hora
    expect(result.length).toBeGreaterThan(8);
  });
});

describe('formatTime', () => {
  it('retorna string vacío para valor falsy', () => {
    expect(formatTime('')).toBe('');
    expect(formatTime(null)).toBe('');
  });

  it('formatea solo la hora de una fecha ISO', () => {
    const result = formatTime('2024-06-15T14:30:00Z');
    expect(result).toBeTruthy();
  });
});

describe('formatPercentage', () => {
  it('retorna "0%" para null', () => {
    expect(formatPercentage(null)).toBe('0%');
    expect(formatPercentage(undefined)).toBe('0%');
  });

  it('incluye signo "+" para valores positivos', () => {
    expect(formatPercentage(5.5)).toBe('+5.5%');
  });

  it('no incluye signo "+" para valores negativos', () => {
    expect(formatPercentage(-3.2)).toBe('-3.2%');
  });

  it('formatea 0 correctamente', () => {
    expect(formatPercentage(0)).toBe('+0.0%');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// priceFormat.js
// ─────────────────────────────────────────────────────────────────────────────

describe('formatPrice', () => {
  it('retorna string vacío para null o undefined', () => {
    expect(formatPrice(null)).toBe('');
    expect(formatPrice(undefined)).toBe('');
  });

  it('retorna string vacío para string vacío', () => {
    expect(formatPrice('')).toBe('');
  });

  it('formatea un número con separadores de miles (punto)', () => {
    expect(formatPrice(350000000)).toBe('350.000.000');
  });

  it('formatea un número pequeño sin separadores', () => {
    expect(formatPrice(500)).toBe('500');
  });

  it('formatea correctamente strings numéricos', () => {
    expect(formatPrice('1000000')).toBe('1.000.000');
  });

  it('elimina caracteres no numéricos del input', () => {
    expect(formatPrice('1.000.000')).toBe('1.000.000');
  });

  it('formatea el valor 0 como "0"', () => {
    expect(formatPrice(0)).toBe('0');
  });
});

describe('parsePriceInput', () => {
  it('retorna string vacío para null o string vacío', () => {
    expect(parsePriceInput(null)).toBe('');
    expect(parsePriceInput('')).toBe('');
    expect(parsePriceInput(undefined)).toBe('');
  });

  it('extrae solo dígitos del input', () => {
    expect(parsePriceInput('350.000.000')).toBe('350000000');
  });

  it('mantiene números sin modificar', () => {
    expect(parsePriceInput('123456')).toBe('123456');
  });

  it('elimina espacios y caracteres especiales', () => {
    expect(parsePriceInput('$ 1,500,000')).toBe('1500000');
  });
});
