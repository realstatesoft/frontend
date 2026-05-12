import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, FALLBACK_LANGUAGE, LANGUAGE_HTML_MAP } from './constants';
import { getInitialLanguage, normalizeLanguage, writeStoredLanguage } from './storage';
import { resources } from './resources';

let initialized = false;
let storageSyncAttached = false;

function syncDocumentLanguage(language) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = LANGUAGE_HTML_MAP[language] || DEFAULT_LANGUAGE;
}

function ensureStorageSync() {
  if (storageSyncAttached) return;
  i18n.on('languageChanged', (language) => {
    const normalized = normalizeLanguage(language) || DEFAULT_LANGUAGE;
    writeStoredLanguage(normalized);
    syncDocumentLanguage(normalized);
  });
  storageSyncAttached = true;
}

export async function initializeI18n() {
  const initialLanguage = getInitialLanguage();
  ensureStorageSync();

  if (!initialized) {
    await i18n.use(initReactI18next).init({
      resources,
      lng: initialLanguage,
      fallbackLng: FALLBACK_LANGUAGE,
      supportedLngs: ['es', 'en', 'pr'],
      defaultNS: 'common',
      ns: [
        'common',
        'navigation',
        'auth',
        'landing',
        'properties',
        'agents',
        'errors',
        'showProperty',
        'reservations',
        'visits',
        'messages',
        'offers',
        'dashboard',
        'admin',
        'owner',
        'agent',
        'clients',
        'reports',
        'contracts',
        'validation',
        'agenda',
        'preferences',
        'tour',
        'propertyViews',
        'locations',
        'tenant',
      ],
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
      returnNull: false,
    });
    initialized = true;
  } else {
    await i18n.changeLanguage(initialLanguage);
  }

  syncDocumentLanguage(normalizeLanguage(i18n.language) || initialLanguage);
  writeStoredLanguage(normalizeLanguage(i18n.language) || initialLanguage);
  return i18n;
}

export { i18n };

export default i18n;
