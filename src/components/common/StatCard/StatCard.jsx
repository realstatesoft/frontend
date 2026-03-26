import styles from './StatCard.module.scss';

export default function StatCard({ label, value, trend, icon, colorAccent = 'accent' }) {
  const trendClass = trend > 0 ? styles['statCard__trend--up'] : styles['statCard__trend--down'];
  const trendSymbol = trend > 0 ? '↑' : '↓';

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
