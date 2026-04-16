import { describe, it, expect } from 'vitest';
import { normalizePhoneForWhatsApp, getWhatsAppLink } from '../../utils/whatsapp';

describe('whatsapp utils', () => {
  describe('normalizePhoneForWhatsApp', () => {
    it.each([
      [null, ''],
      [undefined, ''],
      [123, ''],
      [{}, ''],
      ['+595 (981) 123-456', '595981123456'],
      ['0981123456', '595981123456'],
      ['5491145678901', '5491145678901']
    ])('normalizes %s into %s', (input, expected) => {
      expect(normalizePhoneForWhatsApp(input)).toBe(expected);
    });

    it('respects explicitly provided custom default country code for leading 0', () => {
      expect(normalizePhoneForWhatsApp('0981123456', '54')).toBe('54981123456');
    });
  });

  describe('getWhatsAppLink', () => {
    it.each([
      ['123', null],
      ['021', null],
      ['+595 981 123456', 'https://wa.me/595981123456'],
      ['0981123456', 'https://wa.me/595981123456'] // prefilled empty message handling (not passed)
    ])('generates expected link for phone %s', (input, expected) => {
      expect(getWhatsAppLink(input)).toBe(expected);
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
