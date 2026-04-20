import { useCallback } from "react";
import { Form } from "react-bootstrap";
import { formatPrice, parsePriceInput } from "../../utils/priceFormat";

/**
 * Input numérico para precios con formato de miles (ej: 350.000.000).
 * - Muestra SIEMPRE el valor formateado (350.000.000).
 * - Mientras edita, permite solo dígitos y actualiza el valor crudo (sin puntos) en el padre.
 *
 * Props: value, onChange, placeholder, className, disabled, ...rest (pasados al Form.Control)
 */
export default function PriceInput({
  value = "",
  onChange,
  onBlur,
  placeholder = "0",
  className = "",
  disabled = false,
  ...rest
}) {
  const rawValue = value === null || value === undefined ? "" : String(value);
  const displayValue = formatPrice(rawValue || "");

  const handleChange = useCallback(
    (e) => {
      const normalizedValue = parsePriceInput(e.target.value);
      onChange?.({ target: { value: normalizedValue } });
    },
    [onChange]
  );

  const handleBlur = useCallback(
    (e) => {
      const normalizedValue = parsePriceInput(e.target.value);
      let targetValue = normalizedValue;
      if (normalizedValue.includes(".")) {
        const [integerPart, decimalPart = ""] = normalizedValue.split(".");
        targetValue = `${integerPart}.${decimalPart.padEnd(2, "0").slice(0, 2)}`;
        onChange?.({ target: { value: targetValue } });
      }
      onBlur?.({ ...e, target: { ...e.target, value: targetValue } });
    },
    [onBlur, onChange]
  );

  return (
    <Form.Control
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      {...rest}
    />
  );
}
