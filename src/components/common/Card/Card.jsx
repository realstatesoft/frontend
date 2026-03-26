import styles from './Card.module.scss';

export default function Card({
  padding = 'md',
  hoverable = false,
  title,
  subtitle,
  headerRight,
  children,
  className = '',
}) {
  const classes = [
    styles.card,
    styles[`card--${padding}`],
    hoverable && styles['card--hoverable'],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {(title || headerRight) && (
        <div className={styles.card__header}>
          <div>
            {title && <h3 className={styles.card__title}>{title}</h3>}
            {subtitle && <p className={styles.card__subtitle}>{subtitle}</p>}
          </div>
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
