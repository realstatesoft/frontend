import React from "react";
import { Form } from "react-bootstrap";

/**
 * NumericInput
 * Reusable component that wraps Bootstrap's Form.Control to enforce maximum digit limits
 * and filter out non-numeric characters on-the-fly.
 * 
 * Props:
 *   value         - Input value (string or number)
 *   onChange      - Change handler function
 *   maxDigits     - Maximum number of digits allowed (default: 20)
 *   allowDecimal  - Whether decimal point is allowed (default: false)
 *   ...rest       - Forwarded Form.Control props
 */
export default function NumericInput({
  value,
  onChange,
  maxDigits = 20,
  allowDecimal = false,
  plainInput = false,
  ...rest
}) {
  const handleChange = (e) => {
    const inputValue = e.target.value ?? "";

    let cleaned = "";
    let hasDecimal = false;
    let digitCount = 0;

    for (let char of inputValue) {
      if (char >= "0" && char <= "9") {
        if (digitCount < maxDigits) {
          cleaned += char;
          digitCount++;
        }
      } else if (allowDecimal && char === "." && !hasDecimal) {
        cleaned += char;
        hasDecimal = true;
      }
    }

    if (onChange) {
      const target = {
        ...e.target,
        name: e.target?.name,
        type: e.target?.type,
        value: cleaned,
      };
      onChange({
        ...e,
        target,
        currentTarget: target,
      });
    }
  };

  if (plainInput) {
    return (
      <input
        type="text"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        value={value ?? ""}
        onChange={handleChange}
        {...rest}
      />
    );
  }

  return (
    <Form.Control
      type="text"
      inputMode={allowDecimal ? "decimal" : "numeric"}
      value={value ?? ""}
      onChange={handleChange}
      {...rest}
    />
  );
}
