import React from 'react';
import { IoWarning } from 'react-icons/io5';

/**
 * Componente para mostrar errores de validación con estilo consistente.
 * @param {{ message: string | null }} props
 */
const ValidationError = ({ message }) => {
  if (!message) return null;

  return (
    <div className="pref-form__validation-error" style={{
      color: "#ef4444",
      backgroundColor: "#fef2f2",
      border: "1px solid #fee2e2",
      padding: "0.75rem 1rem",
      borderRadius: "0.5rem",
      marginBottom: "1rem",
      fontSize: "0.875rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }}>
      <IoWarning size={18} />
      {message}
    </div>
  );
};

export default ValidationError;
