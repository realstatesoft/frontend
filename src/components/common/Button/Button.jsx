import styles from './Button.module.scss';

export default function Button({
  variant = 'primary',
  size,
  fullWidth,
  disabled,
  onClick,
  type = 'button',
  children,
  className = '',
}) {
  const classes = [
    styles.button,
    styles[`button--${variant}`],
    size && styles[`button--${size}`],
    fullWidth && styles['button--full'],
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
