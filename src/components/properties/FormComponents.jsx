import { useState, useEffect, useRef } from "react";
import { Form } from "react-bootstrap";

// ── Tag (chip removible) ─────────────────────────────────────────────────────

export const FormTag = ({ label, onRemove }) => (
  <span
    className="d-inline-flex align-items-center gap-2 me-1 mb-1"
    style={{
      backgroundColor: "rgba(13, 110, 253, 0.1)",
      color: "var(--bs-primary)",
      fontSize: 13,
      padding: "6px 12px",
      borderRadius: "8px",
      fontWeight: 500,
    }}
  >
    {label}
    <button
      type="button"
      onClick={onRemove}
      style={{
        background: "transparent",
        border: "none",
        color: "var(--bs-primary)",
        fontSize: 14,
        cursor: "pointer",
        padding: 0,
        lineHeight: 1,
      }}
      aria-label="Eliminar"
    >
      ×
    </button>
  </span>
);

// ── MultiSelect (dropdown con chips) ───────────────────────────────────────────

export function FormMultiSelect({ options, selected, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Case-insensitive helpers so API values (e.g. "Comprador Serio") match
  // option labels (e.g. "Comprador serio") without duplicates.
  const isSelected = (val) =>
    selected.some((s) => s.toLowerCase() === val.toLowerCase());

  const toggle = (val) =>
    isSelected(val)
      ? onChange(selected.filter((s) => s.toLowerCase() !== val.toLowerCase()))
      : onChange([...selected, val]);

  return (
    <div ref={containerRef} className="position-relative">
      <div
        className="form-control d-flex justify-content-between align-items-center"
        style={{ cursor: "pointer", color: "#888" }}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{placeholder}</span>
        <i className={`bi bi-chevron-${open ? "up" : "down"} text-muted`} style={{ fontSize: 12 }} />
      </div>

      {open && (
        <div
          className="position-absolute w-100 bg-white border rounded shadow-sm"
          style={{ top: "105%", zIndex: 300 }}
        >
          {options.map((opt) => (
            <div
              key={opt}
              className="px-3 py-2"
              style={{
                cursor: "pointer",
                fontSize: 14,
                background: isSelected(opt) ? "#EAF0FF" : "#fff",
                color: isSelected(opt) ? "#3B6BF5" : "#333",
              }}
              onClick={() => toggle(opt)}
            >
              {isSelected(opt) && <i className="bi bi-check2 me-2" />}
              {opt}
            </div>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="mt-2">
          <small className="text-muted d-block mb-1">Características seleccionadas</small>
          <div className="d-flex flex-wrap">
            {selected.map((s, i) => (
              <FormTag
                key={`${s}-${i}`}
                label={s}
                onRemove={() => onChange(selected.filter((_, idx) => idx !== i))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Título de sección ───────────────────────────────────────────────────────

export const FormSectionTitle = ({ title }) => (
  <h5 className="fw-medium mb-2 text-start">{title}</h5>
);

// ── Label con asterisco opcional ─────────────────────────────────────────────

export const FormLabel = ({ children, required }) => (
  <Form.Label className="fw-regular">
    {children}
    {required && <span className="ms-1">*</span>}
  </Form.Label>
);
