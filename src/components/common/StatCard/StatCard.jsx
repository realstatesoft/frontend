import styles from './StatCard.module.scss';

export default function StatCard({ label, value, trend, icon, colorAccent = 'accent' }) {
  let trendClass = styles['statCard__trend--neutral'];
  let trendSymbol = '→';

  if (trend > 0) {
    trendClass = styles['statCard__trend--up'];
    trendSymbol = '↑';
  } else if (trend < 0) {
    trendClass = styles['statCard__trend--down'];
    trendSymbol = '↓';
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
      <span className={styles.statCard__value}>{value}</span>
      {trend !== undefined && trend !== null && (
        <span className={`${styles.statCard__trend} ${trendClass}`}>
          {trendSymbol} {Math.abs(trend)}%
        </span>
      )}
    </div>
  );
}
