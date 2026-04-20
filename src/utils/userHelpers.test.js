import { describe, it, expect, vi } from 'vitest';
import { isUserSuspended, getUserStatusLabel } from './userHelpers';

describe('userHelpers util', () => {
  describe('isUserSuspended', () => {
    it('returns false if no suspension date', () => {
      expect(isUserSuspended({})).toBe(false);
      expect(isUserSuspended({ suspendedUntil: null })).toBe(false);
    });

    it('returns true if suspension date is in the future', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      expect(isUserSuspended({ suspendedUntil: future.toISOString() })).toBe(true);
    });

    it('returns false if suspension date is in the past', () => {
      const past = new Date();
      past.setFullYear(past.getFullYear() - 1);
      expect(isUserSuspended({ suspendedUntil: past.toISOString() })).toBe(false);
    });
  });

  describe('getUserStatusLabel', () => {
    it('returns Activo for non-suspended users', () => {
      const result = getUserStatusLabel({});
      expect(result.label).toBe('Activo');
      expect(result.variant).toBe('success');
    });

    it('returns Suspendido indefinidamente for long-term suspensions', () => {
      const result = getUserStatusLabel({ suspendedUntil: '9999-12-31T23:59:59Z' });
      expect(result.label).toBe('Suspendido indefinidamente');
      expect(result.variant).toBe('danger');
    });

    it('returns Suspendido hasta [fecha] for short-term future suspensions', () => {
      const futureDate = '2030-05-20T10:00:00Z';
      const result = getUserStatusLabel({ suspendedUntil: futureDate });
      expect(result.label).toContain('Suspendido hasta 20/5/2030');
      expect(result.variant).toBe('danger');
    });
  });
});
