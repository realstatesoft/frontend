import React from "react";
import {
  CheckCircle,
  XCircle,
  Dash,
  Plus,
  ArrowLeft,
  ArrowRight,
} from "react-bootstrap-icons";

function YesNoButtons({ value, onChange }) {
  return (
    <div className="sell-wizard__yes-no">
      <button
        type="button"
        className={`sell-wizard__yes-no-btn ${value === true ? "sell-wizard__yes-no-btn--selected" : ""}`}
        onClick={() => onChange(true)}
      >
        <CheckCircle size={18} /> Sí
      </button>
      <button
        type="button"
        className={`sell-wizard__yes-no-btn ${value === false ? "sell-wizard__yes-no-btn--selected" : ""}`}
        onClick={() => onChange(false)}
      >
        <XCircle size={18} /> No
      </button>
    </div>
  );
}

function Counter({ label, value, onChange, min = 0, max = 10 }) {
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

export default function StepFeatures({ form, set, nextStep, prevStep }) {
  const canContinue = form.hasPool !== null;

  return (
    <div className="sell-wizard__step">
      <h2 className="sell-wizard__title">Características adicionales</h2>
      <p className="sell-wizard__subtitle">
        Contanos sobre las comodidades de tu propiedad.
      </p>

      <div className="sell-wizard__form-group">
        <label className="sell-wizard__label">¿Tu propiedad tiene piscina?</label>
        <YesNoButtons
          value={form.hasPool}
          onChange={(v) => set("hasPool", v)}
        />
      </div>

      <Counter
        label="Espacios de estacionamiento techados"
        value={form.parkingSpaces}
        onChange={(v) => set("parkingSpaces", v)}
      />

      <div className="sell-wizard__form-group">
        <label className="sell-wizard__label">
          ¿El ingreso es a través de un área segura compartida (lobby, portería)?
        </label>
        <YesNoButtons
          value={form.hasSecureEntry}
          onChange={(v) => set("hasSecureEntry", v)}
        />
      </div>

      <div className="sell-wizard__form-group">
        <label className="sell-wizard__label">¿Tu propiedad tiene sótano?</label>
        <YesNoButtons
          value={form.hasBasement}
          onChange={(v) => set("hasBasement", v)}
        />
      </div>

      {form.hasBasement && (
        <div className="sell-wizard__form-group">
          <label className="sell-wizard__label">Superficie del sótano (m²)</label>
          <input
            type="number"
            className="sell-wizard__input"
            placeholder="Ej: 50"
            value={form.basementArea}
            onChange={(e) => set("basementArea", e.target.value)}
          />
        </div>
      )}

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
