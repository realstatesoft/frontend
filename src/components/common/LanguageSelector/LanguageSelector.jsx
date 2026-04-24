import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGE_META, DEFAULT_LANGUAGE } from '../../../i18n/constants';
import { normalizeLanguage, writeStoredLanguage } from '../../../i18n/storage';
import styles from './LanguageSelector.module.scss';

const OPTIONS = ['es', 'en', 'pr'];

export default function LanguageSelector({ variant = 'light', className = '' }) {
  const { i18n, t } = useTranslation('navigation');
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const currentLanguage = normalizeLanguage(i18n.resolvedLanguage || i18n.language) || DEFAULT_LANGUAGE;
  const currentMeta = LANGUAGE_META[currentLanguage] || LANGUAGE_META.es;

  const buttonClassName = [
    styles.languageSelector__button,
    variant === 'dark' && styles['languageSelector__button--dark'],
  ].filter(Boolean).join(' ');

  useEffect(() => {
    function handleOutsideClick(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const options = useMemo(() => OPTIONS.map((code) => ({
    code,
    meta: LANGUAGE_META[code] || LANGUAGE_META.es,
  })), []);

  async function handleSelect(code) {
    const normalized = normalizeLanguage(code) || DEFAULT_LANGUAGE;
    writeStoredLanguage(normalized);
    await i18n.changeLanguage(normalized);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={`${styles.languageSelector} ${className}`.trim()}>
      <button
        type="button"
        className={buttonClassName}
        onClick={() => setOpen((value) => !value)}
        aria-label={t('language.label')}
        aria-expanded={open}
      >
        <span className={styles.languageSelector__flag} aria-hidden="true">{currentMeta.flag}</span>
        <span>{currentMeta.code}</span>
      </button>

      {open && (
        <div className={styles.languageSelector__menu} role="menu" aria-label={t('language.label')}>
          {options.map(({ code, meta }) => (
            <button
              key={code}
              type="button"
              className={[
                styles.languageSelector__item,
                code === currentLanguage && styles['languageSelector__item--active'],
              ].filter(Boolean).join(' ')}
              onClick={() => handleSelect(code)}
              role="menuitemradio"
              aria-checked={code === currentLanguage}
            >
              <span className={styles.languageSelector__itemFlag} aria-hidden="true">{meta.flag}</span>
              <span className={styles.languageSelector__itemLabel}>{t(`language.${code}`)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

