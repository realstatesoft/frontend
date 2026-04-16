import { describe, it, expect } from 'vitest';
import { normalizePhoneForWhatsApp, getWhatsAppLink } from '../../utils/whatsapp';

describe('whatsapp utils', () => {
  describe('normalizePhoneForWhatsApp', () => {
    it('returns empty string for null, undefined or non-string', () => {
      expect(normalizePhoneForWhatsApp(null)).toBe('');
      expect(normalizePhoneForWhatsApp(undefined)).toBe('');
      expect(normalizePhoneForWhatsApp(123)).toBe('');
      expect(normalizePhoneForWhatsApp({})).toBe('');
    });

    it('removes spaces, dashes, parentheses and + signs', () => {
      expect(normalizePhoneForWhatsApp('+595 (981) 123-456')).toBe('595981123456');
    });

    it('replaces leading 0 with default country code', () => {
      // 0981 123 456 -> 595 981 123 456
      expect(normalizePhoneForWhatsApp('0981123456')).toBe('595981123456');
    });

    it('respects explicitly provided custom default country code for leading 0', () => {
      expect(normalizePhoneForWhatsApp('0981123456', '54')).toBe('54981123456');
    });

    it('keeps existing country codes if not starting with 0', () => {
      expect(normalizePhoneForWhatsApp('5491145678901')).toBe('5491145678901');
    });
  });

  describe('getWhatsAppLink', () => {
    it('returns null if normalized phone is too short (< 8 digits)', () => {
      expect(getWhatsAppLink('123')).toBeNull();
      expect(getWhatsAppLink('021')).toBeNull(); 
    });

    it('generates wa.me link without message', () => {
      expect(getWhatsAppLink('+595 981 123456')).toBe('https://wa.me/595981123456');
    });

    it('generates wa.me link with uri-encoded message', () => {
      const msg = 'Hola, me interesa la propiedad 123';
      const link = getWhatsAppLink('0981123456', '595', msg);
      expect(link).toBe('https://wa.me/595981123456?text=Hola%2C%20me%20interesa%20la%20propiedad%20123');
    });

    it('ignores empty prefilled messages', () => {
      expect(getWhatsAppLink('0981123456', '595', '   ')).toBe('https://wa.me/595981123456');
    });
  });
});
