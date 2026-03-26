import styles from './Badge.module.scss';

const VARIANT_MAP = {
  success: styles['badge--success'],
  warning: styles['badge--warning'],
  danger: styles['badge--danger'],
  info: styles['badge--info'],
  accent: styles['badge--accent'],
  neutral: styles['badge--neutral'],
};

export default function Badge({ variant = 'neutral', children }) {
  const variantClass = VARIANT_MAP[variant] || VARIANT_MAP.neutral;

  return (
    <span className={`${styles.badge} ${variantClass}`}>
      {children}
    </span>
  );
}
