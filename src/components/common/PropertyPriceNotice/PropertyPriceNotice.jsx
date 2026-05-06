export default function PropertyPriceNotice({ className = '', children }) {
  return (
    <p className={`text-muted small mb-0 ${className}`.trim()}>
      {children}
    </p>
  );
}
