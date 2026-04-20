import { describe, it, expect } from 'vitest';
import { normalizePhoneForWhatsApp, getWhatsAppLink } from './whatsapp';

describe('whatsapp util', () => {
  describe('normalizePhoneForWhatsApp', () => {
    it('normalizes international numbers by removing non-digits', () => {
      expect(normalizePhoneForWhatsApp('+595 981 123456')).toBe('595981123456');
      expect(normalizePhoneForWhatsApp(' (595) 21-000 ')).toBe('59521000');
    });

    it('replaces leading 0 with default country code', () => {
      expect(normalizePhoneForWhatsApp('0981 123456')).toBe('595981123456');
      expect(normalizePhoneForWhatsApp('021 123', '44')).toBe('4421123');
    });

    it('returns empty string for invalid input', () => {
      expect(normalizePhoneForWhatsApp(null)).toBe('');
      expect(normalizePhoneForWhatsApp(undefined)).toBe('');
      expect(normalizePhoneForWhatsApp('abc')).toBe('');
    });
  });

  describe('getWhatsAppLink', () => {
    it('generates a wa.me link for valid numbers', () => {
      expect(getWhatsAppLink('0981 123')).toBe('https://wa.me/595981123');
    });

    it('includes encoded prefilled message if provided', () => {
      const link = getWhatsAppLink('0981 123', '595', 'Hola, ¿cómo estás?');
      expect(link).toBe('https://wa.me/595981123?text=Hola%2C%20%C2%BFc%C3%B3mo%20est%C3%A1s%3F');
    });

    it('returns null if normalized number is too short', () => {
      expect(getWhatsAppLink('123')).toBe(null);
    });
  });
});
