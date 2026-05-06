import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES, normalizeCurrency } from '../../../store/useCurrencyStore';
import useCurrencyStore from '../../../store/useCurrencyStore';
import styles from './CurrencySelector.module.scss';

const CURRENCY_META = {
  PYG: { code: 'PYG', label: 'Guaraní', symbol: '₲' },
  USD: { code: 'USD', label: 'US Dollar', symbol: '$' },
  BRL: { code: 'BRL', label: 'Real', symbol: 'R$' },
};

export default function CurrencySelector({ variant = 'light', className = '' }) {
  const { t } = useTranslation('navigation');
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  const setCurrency = useCurrencyStore((state) => state.setCurrency);

  const currentCurrency = normalizeCurrency(selectedCurrency) || DEFAULT_CURRENCY;
  const currentMeta = CURRENCY_META[currentCurrency] || CURRENCY_META.PYG;

  const buttonClassName = [
    styles.currencySelector__button,
    variant === 'dark' && styles['currencySelector__button--dark'],
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

  const options = useMemo(() => SUPPORTED_CURRENCIES.map((code) => ({
    code,
    meta: CURRENCY_META[code] || CURRENCY_META.PYG,
  })), []);

  function handleSelect(code) {
    const normalized = normalizeCurrency(code) || DEFAULT_CURRENCY;
    setCurrency(normalized);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={`${styles.currencySelector} ${className}`.trim()}>
      <button
        type="button"
        className={buttonClassName}
        onClick={() => setOpen((value) => !value)}
        aria-label={t('currency.label', { defaultValue: 'Currency' })}
        aria-expanded={open}
      >
        <span className={styles.currencySelector__symbol} aria-hidden="true">{currentMeta.symbol}</span>
        <span>{currentMeta.code}</span>
      </button>

      {open && (
        <div className={styles.currencySelector__menu} role="menu" aria-label={t('currency.label', { defaultValue: 'Currency' })}>
          {options.map(({ code, meta }) => (
            <button
              key={code}
              type="button"
              className={[
                styles.currencySelector__item,
                code === currentCurrency && styles['currencySelector__item--active'],
              ].filter(Boolean).join(' ')}
              onClick={() => handleSelect(code)}
              role="menuitemradio"
              aria-checked={code === currentCurrency}
            >
              <span className={styles.currencySelector__itemSymbol} aria-hidden="true">{meta.symbol}</span>
              <span className={styles.currencySelector__itemLabel}>{meta.code} · {meta.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
