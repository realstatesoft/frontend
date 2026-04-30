import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n, initializeI18n } from '../../i18n';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
} from '../../i18n/constants';
import {
  getInitialLanguage,
  readStoredLanguage,
  writeStoredLanguage,
} from '../../i18n/storage';

describe('i18n setup', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults to Spanish when nothing is stored', async () => {
    expect(getInitialLanguage()).toBe(DEFAULT_LANGUAGE);

    await initializeI18n();

    expect(i18n.language).toBe(DEFAULT_LANGUAGE);
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe(DEFAULT_LANGUAGE);
  });

  it('reads and writes the persisted language from localStorage', () => {
    expect(readStoredLanguage()).toBe(null);

    expect(writeStoredLanguage('en')).toBe('en');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    expect(readStoredLanguage()).toBe('en');

    expect(writeStoredLanguage('pt-BR')).toBe('pr');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('pr');
    expect(readStoredLanguage()).toBe('pr');
  });

  it('falls back to Spanish when a translation is missing', async () => {
    await initializeI18n();
    await i18n.changeLanguage('en');

    expect(i18n.t('fallbackOnlyInSpanish', { ns: 'common' })).toBe('Solo existe en español');
  });
});
