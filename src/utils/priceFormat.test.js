import { describe, it, expect } from 'vitest';
import { formatPrice, parsePriceInput } from './priceFormat';

describe('priceFormat util', () => {
  describe('formatPrice', () => {
    it('formats numbers with dots as thousands separators', () => {
      expect(formatPrice(350000000)).toBe('350.000.000');
      expect(formatPrice(1000)).toBe('1.000');
      expect(formatPrice(50)).toBe('50');
    });

    it('handles string inputs', () => {
      expect(formatPrice('350000')).toBe('350.000');
      expect(formatPrice('000123')).toBe('123');
    });

    it('returns empty string for null, undefined or empty input', () => {
      expect(formatPrice(null)).toBe('');
      expect(formatPrice(undefined)).toBe('');
      expect(formatPrice('')).toBe('');
    });

    it('preserves valid decimal patterns while formatting', () => {
      expect(formatPrice('abc1.2dc3')).toBe('1,23');
    });

    it('formats decimal values using locale separators', () => {
      expect(formatPrice('1200.50')).toBe('1.200,50');
      expect(formatPrice('1.200,5')).toBe('1.200,5');
    });
  });

  describe('parsePriceInput', () => {
    it('keeps integer values as raw number strings', () => {
      expect(parsePriceInput('350.000.000')).toBe('350000000');
    });

    it('normalizes decimal input instead of concatenating digits across the separator', () => {
      expect(parsePriceInput(' $1,200.50 ')).toBe('1200.50');
      expect(parsePriceInput('1.200,50')).toBe('1200.50');
      expect(parsePriceInput('350000.567')).toBe('350000567');
    });

    it('returns empty string for null or empty input', () => {
      expect(parsePriceInput(null)).toBe('');
      expect(parsePriceInput('')).toBe('');
    });
  });
});
