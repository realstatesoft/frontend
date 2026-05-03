import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
} from './constants';

export function normalizeLanguage(language) {
  if (!language) return null;

  const raw = String(language).trim().toLowerCase();
  const base = raw.split('-')[0];

  if (base === 'pt') return 'pr';
  if (SUPPORTED_LANGUAGES.includes(base)) return base;
  return null;
}

export function readStoredLanguage(storage = globalThis?.localStorage) {
  if (!storage) return null;
  return normalizeLanguage(storage.getItem(LANGUAGE_STORAGE_KEY));
}

export function writeStoredLanguage(language, storage = globalThis?.localStorage) {
  if (!storage) return DEFAULT_LANGUAGE;

  const normalized = normalizeLanguage(language) ?? DEFAULT_LANGUAGE;
  storage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  return normalized;
}

export function getInitialLanguage(storage = globalThis?.localStorage) {
  return readStoredLanguage(storage) ?? DEFAULT_LANGUAGE;
}

