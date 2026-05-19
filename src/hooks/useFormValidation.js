import { useState, useCallback, useMemo } from "react";

/**
 * Hook reutilizable para validación de formularios con resaltado de campos obligatorios.
 *
 * @returns {Object} - { fieldErrors, validate, clearFieldError, clearAllErrors, hasErrors }
 *
 * @example
 * const { fieldErrors, validate, clearFieldError, hasErrors } = useFormValidation();
 *
 * const handleSubmit = (e) => {
 *   e.preventDefault();
 *   const valid = validate({
 *     nombre: { value: formData.nombre, label: "Nombre" },
 *     email: { value: formData.email, label: "Email", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email inválido" } },
 *   });
 *   if (!valid) return;
 *   // enviar...
 * };
 */
export function useFormValidation() {
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = useCallback((fields) => {
    const errors = {};

    for (const [name, config] of Object.entries(fields)) {
      const { value, label, required, requiredMessage, minLength, minLengthMessage, pattern, custom, customMessage } = config;
      const strValue = String(value ?? "").trim();

      if (required && !strValue) {
        errors[name] = requiredMessage || `${label} es obligatorio`;
        continue;
      }

      if (strValue && minLength && strValue.length < minLength) {
        errors[name] = minLengthMessage || `${label} debe tener al menos ${minLength} caracteres`;
        continue;
      }

      if (strValue && pattern && !pattern.value.test(strValue)) {
        errors[name] = pattern.message || `${label} tiene un formato inválido`;
        continue;
      }

      if (strValue && custom && !custom(value)) {
        errors[name] = customMessage || `${label} es inválido`;
        continue;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  const clearFieldError = useCallback((fieldName) => {
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const { [fieldName]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const hasErrors = useMemo(
    () => Object.keys(fieldErrors).length > 0,
    [fieldErrors]
  );

  return { fieldErrors, validate, clearFieldError, clearAllErrors, hasErrors };
}
