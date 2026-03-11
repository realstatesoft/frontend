import React from "react";
import {
  Wrench,
  CalendarDate,
  CheckCircle,
  StarFill,
  Gem,
  ArrowLeft,
  ArrowRight,
} from "react-bootstrap-icons";

const CONDITIONS = [
  {
    value: "fixer_upper",
    Icon: Wrench,
    label: "A reparar",
    desc: "Necesita reparaciones importantes",
  },
  {
    value: "dated",
    Icon: CalendarDate,
    label: "Antigueda",
    desc: "No actualizada recientemente",
  },
  {
    value: "standard",
    Icon: CheckCircle,
    label: "Estándar",
    desc: "Acabados comunes y funcionales",
  },
  {
    value: "high_end",
    Icon: StarFill,
    label: "Alta gama",
    desc: "Mejoras de alta calidad",
  },
  {
    value: "luxury",
    Icon: Gem,
    label: "Lujo",
    desc: "Acabados elegantes de primera",
  },
];

export default function ConditionSelector({ title, subtitle, value, onChange, onNext, onBack }) {
  const canContinue = value !== null;

  return (
    <div className="sell-wizard__step">
      <h2 className="sell-wizard__title">{title}</h2>
      <p className="sell-wizard__subtitle">{subtitle}</p>

      <div className="sell-wizard__condition-cards">
        {CONDITIONS.map((cond) => {
          const ConditionIcon = cond.Icon;
          return (
            <div
              key={cond.value}
              className={`sell-wizard__condition-card ${value === cond.value ? "sell-wizard__condition-card--selected" : ""}`}
              onClick={() => onChange(cond.value)}
            >
              <span className="sell-wizard__condition-emoji">
                <ConditionIcon size={24} />
              </span>
              <span className="sell-wizard__condition-label">{cond.label}</span>
              <span className="sell-wizard__condition-desc">{cond.desc}</span>
            </div>
          );
        })}
      </div>

      <div className="sell-wizard__actions">
        <button
          type="button"
          className="sell-wizard__btn sell-wizard__btn--back"
          onClick={onBack}
        >
          <ArrowLeft /> Atrás
        </button>
        <button
          type="button"
          className="sell-wizard__btn sell-wizard__btn--next"
          onClick={onNext}
          disabled={!canContinue}
        >
          Continuar <ArrowRight />
        </button>
      </div>
    </div>
  );
}
