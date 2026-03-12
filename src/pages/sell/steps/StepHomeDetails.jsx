import React from "react";
import { Dash, Plus, ArrowLeft, ArrowRight } from "react-bootstrap-icons";

function Counter({ label, value, onChange, min = 0, max = 20 }) {
  return (
    <div className="sell-wizard__counter">
      <span className="sell-wizard__counter-label">{label}</span>
      <div className="sell-wizard__counter-controls">
        <button
          type="button"
          className="sell-wizard__counter-btn"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          <Dash />
        </button>
        <span className="sell-wizard__counter-value">{value}</span>
        <button
          type="button"
          className="sell-wizard__counter-btn"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          <Plus />
        </button>
      </div>
    </div>
  );
}

export default function StepHomeDetails({ form, set, nextStep, prevStep }) {
  const canContinue = true;

  return (
    <div className="sell-wizard__step">
      <h2 className="sell-wizard__title">Revisá los detalles de tu propiedad</h2>
      <p className="sell-wizard__subtitle">
        Esta información nos ayuda a valorar tu propiedad correctamente.
      </p>

      <div className="sell-wizard__form-group">
        <label className="sell-wizard__label">Superficie total (m²)</label>
        <input
          type="number"
          className="sell-wizard__input"
          placeholder="Ej: 450"
          value={form.surfaceArea}
          onChange={(e) => set("surfaceArea", e.target.value)}
        />
      </div>

      <div className="sell-wizard__form-group">
        <label className="sell-wizard__label">Superficie construida (m²)</label>
        <input
          type="number"
          className="sell-wizard__input"
          placeholder="Ej: 320"
          value={form.builtArea}
          onChange={(e) => set("builtArea", e.target.value)}
        />
      </div>

      <div className="sell-wizard__form-group">
        <label className="sell-wizard__label">Año de construcción</label>
        <input
          type="number"
          className="sell-wizard__input"
          placeholder="Ej: 2015"
          value={form.yearBuilt}
          onChange={(e) => set("yearBuilt", e.target.value)}
        />
      </div>

      <Counter
        label="Dormitorios"
        value={form.bedrooms}
        onChange={(v) => set("bedrooms", v)}
      />

      <Counter
        label="Baños completos"
        value={form.threeQuarterBath}
        onChange={(v) => set("threeQuarterBath", v)}
      />

      <Counter
        label="Medios baños (toilettes)"
        value={form.halfBath}
        onChange={(v) => set("halfBath", v)}
      />

      <Counter
        label="Pisos / Plantas"
        value={form.floors}
        onChange={(v) => set("floors", v)}
        min={1}
      />

      <div className="sell-wizard__actions">
        <button
          type="button"
          className="sell-wizard__btn sell-wizard__btn--back"
          onClick={prevStep}
        >
          <ArrowLeft /> Atrás
        </button>
        <button
          type="button"
          className="sell-wizard__btn sell-wizard__btn--next"
          onClick={nextStep}
          disabled={!canContinue}
        >
          Continuar <ArrowRight />
        </button>
      </div>
    </div>
  );
}
