import { useMemo, useState } from "react";

export default function TagInput({
  label,
  placeholder,
  value,
  onChange,
  suggestions = [],
}) {
  const [text, setText] = useState("");

  const normalized = useMemo(() => new Set(value.map((v) => v.toLowerCase())), [value]);

  function addTag(raw) {
    const t = raw.trim();
    if (!t) return;
    if (normalized.has(t.toLowerCase())) return;
    onChange([...value, t]);
    setText("");
  }

  function removeTag(tag) {
    onChange(value.filter((v) => v !== tag));
  }

  return (
    <div>
      {label ? <div className="fw-semibold mb-2">{label}</div> : null}

      <div className="d-flex flex-wrap gap-2 mb-2">
        {value.map((t) => (
          <span
            key={t}
            className="badge bg-light text-dark border rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2"
          >
            <span>{t}</span>
            <button
              type="button"
              className="btn btn-sm p-0 border-0 bg-transparent"
              onClick={() => removeTag(t)}
              aria-label={`Eliminar ${t}`}
              style={{ lineHeight: 1 }}
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      <div className="d-flex gap-2 flex-wrap">
        <input
          className="form-control"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(text);
            }
          }}
        />
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => addTag(text)}
        >
          Agregar
        </button>
      </div>

      {suggestions.length > 0 ? (
        <div className="mt-2 d-flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill"
              onClick={() => addTag(s)}
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

