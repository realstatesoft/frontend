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
  placeholder = "0",
  className = "",
  disabled = false,
  ...rest
}) {
  const rawValue =
    value === null || value === undefined ? "" : String(value).replace(/\D/g, "");
  const displayValue = formatPrice(rawValue || "");

  const handleChange = useCallback(
    (e) => {
      const rawDigits = parsePriceInput(e.target.value);
      onChange?.({ target: { value: rawDigits } });
    },
    [onChange]
  );

  return (
    <Form.Control
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      {...rest}
    />
  );
}
