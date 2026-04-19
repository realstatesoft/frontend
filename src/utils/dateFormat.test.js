import { describe, it, expect, vi } from 'vitest';
import { formatTimeAgo, formatDateTime, toDateTimeLocalInput } from './dateFormat';

describe('dateFormat utils', () => {
  describe('formatTimeAgo', () => {
    it('returns empty string if no date provided', () => {
      expect(formatTimeAgo(null)).toBe('');
    });

    it('returns "hace un momento" for very recent dates', () => {
      const now = new Date().toISOString();
      expect(formatTimeAgo(now)).toBe('hace un momento');
    });

    it('returns "hace X minutos"', () => {
      const fiveMinsAgo = new Date(Date.now() - 5 * 60000).toISOString();
      expect(formatTimeAgo(fiveMinsAgo)).toBe('hace 5 minutos');
    });

    it('returns "hace X horas"', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString();
      expect(formatTimeAgo(twoHoursAgo)).toBe('hace 2 horas');
    });

    it('returns "hace X días"', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
      expect(formatTimeAgo(threeDaysAgo)).toBe('hace 3 días');
    });

    it('returns locale date string for old dates (> 7 days)', () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 86400000);
      const result = formatTimeAgo(tenDaysAgo.toISOString());
      expect(result).toBe(tenDaysAgo.toLocaleDateString());
    });
  });

  describe('formatDateTime', () => {
    it('returns empty string for null input', () => {
      expect(formatDateTime(null)).toBe('');
    });

    it('returns empty string for invalid date', () => {
      expect(formatDateTime('invalid-date')).toBe('');
    });

    it('formats date correctly for es-PY (default)', () => {
      const date = '2023-10-25T15:30:00';
      const formatted = formatDateTime(date);
      // es-PY uses "25 oct 2023" or similar
      expect(formatted).toContain('2023');
      expect(formatted).toContain('15:30');
    });
  });

  describe('toDateTimeLocalInput', () => {
    it('returns empty string for null input', () => {
      expect(toDateTimeLocalInput(null)).toBe('');
    });

    it('returns empty string for invalid date', () => {
      expect(toDateTimeLocalInput('invalid-date')).toBe('');
    });

    it('converts ISO to YYYY-MM-DDTHH:mm format', () => {
      const date = '2023-05-10T09:45:00';
      expect(toDateTimeLocalInput(date)).toBe('2023-05-10T09:45');
    });

    it('pads single digits with zero', () => {
      const date = '2023-01-02T03:04:00';
      expect(toDateTimeLocalInput(date)).toBe('2023-01-02T03:04');
    });
  });
});
