import { describe, it, expect, beforeEach } from 'vitest';
import { i18n, initializeI18n } from '../../i18n';
import { LANGUAGE_STORAGE_KEY } from '../../i18n/constants';

describe('i18n persistence across reloads', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps the stored language after re-initialization', async () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
    await initializeI18n();

    expect(i18n.language).toBe('en');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');

    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'pr');
    await initializeI18n();

    expect(i18n.language).toBe('pr');
    expect(document.documentElement.lang).toBe('pt');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('pr');
  });
});
