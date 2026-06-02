import styles from './StatCard.module.scss';

function formatTrendPercent(trend) {
  const v = Math.abs(Number(trend));
  if (Number.isNaN(v)) return null;
  return Number(v.toFixed(2));
}

export default function StatCard({ label, value, subtitle, trend, icon, colorAccent = 'accent', hint, stacked = false }) {
  let trendClass = styles['statCard__trend--neutral'];
  let trendSymbol = '→';

  if (trend > 0) {
    trendClass = styles['statCard__trend--up'];
    trendSymbol = '↑';
  } else if (trend < 0) {
    trendClass = styles['statCard__trend--down'];
    trendSymbol = '↓';
  }

  const formattedTrend =
    trend === undefined || trend === null ? null : formatTrendPercent(trend);

  if (stacked) {
    return (
      <div className={styles.statCard}>
        <div className={styles.statCard__header}>
          <span className={styles.statCard__label}>{label}</span>
          {icon && (
            <div className={`${styles.statCard__icon} ${styles[`statCard__icon--${colorAccent}`]}`}>
              {icon}
            </div>
          )}
        </div>
        <div className={styles.statCard__body} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span className={styles.statCard__value} style={{ fontSize: '1.5rem', overflow: 'visible', textOverflow: 'clip', whiteSpace: 'normal', wordBreak: 'break-word' }}>{value}</span>
          {subtitle ? <span className={styles.statCard__subtitle}>{subtitle}</span> : null}
          {formattedTrend !== null && (
            <span className={`${styles.statCard__trend} ${trendClass}`}>
              {trendSymbol} {formattedTrend}%
            </span>
          )}
          {hint ? <span className={styles.statCard__hint}>{hint}</span> : null}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.statCard}>
      <div className={styles.statCard__header}>
        <span className={styles.statCard__label}>{label}</span>
        {icon && (
          <div className={`${styles.statCard__icon} ${styles[`statCard__icon--${colorAccent}`]}`}>
            {icon}
          </div>
        )}
      </div>

      <div className={styles.statCard__body}>
        <div className={styles.statCard__metrics}>
          <span className={styles.statCard__value}>{value}</span>
          {subtitle ? <span className={styles.statCard__subtitle}>{subtitle}</span> : null}
          {formattedTrend !== null && (
            <span className={`${styles.statCard__trend} ${trendClass}`}>
              {trendSymbol} {formattedTrend}%
            </span>
          )}
        </div>
        {hint ? <span className={styles.statCard__hint}>{hint}</span> : null}
      </div>
    </div>
  );
}
