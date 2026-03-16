import React from "react";
import {
  PersonBadge,
  PersonCheck,
  Building,
  FileEarmarkText,
  PersonX,
  ArrowLeft,
  ArrowRight,
} from "react-bootstrap-icons";

const OPTIONS = [
  {
    value: "agent_for_owner",
    label: "Soy agente inmobiliario del propietario",
    desc: "Represento al dueño de la propiedad",
    Icon: PersonBadge,
  },
  {
    value: "agent_and_owner",
    label: "Soy agente inmobiliario y también propietario",
    desc: "La propiedad es mía y soy agente",
    Icon: PersonCheck,
  },
  {
    value: "builder",
    label: "Trabajo con un desarrollador/constructora",
    desc: "Estoy vendiendo una propiedad nueva",
    Icon: Building,
  },
  {
    value: "signed_agreement",
    label: "Tengo un acuerdo firmado con un agente",
    desc: "Ya tengo un agente asignado",
    Icon: FileEarmarkText,
  },
  {
    value: "none",
    label: "Ninguna de estas aplica",
    desc: "Soy propietario sin agente",
    Icon: PersonX,
  },
];

export default function StepAgentRelationship({ form, set, nextStep, prevStep }) {
  const canContinue = form.agentRelationship !== null;

  return (
    <div className="sell-wizard__step">
      <h2 className="sell-wizard__title">Antes de empezar, ¿alguna de estas aplica?</h2>
      <p className="sell-wizard__subtitle">
        Es posible que debamos compartir tus opciones de venta con tu agente si ya firmaste un acuerdo.
      </p>

      <div className="sell-wizard__options">
        {OPTIONS.map((option) => (
          <div
            key={option.value}
            className={`sell-wizard__option ${form.agentRelationship === option.value ? "sell-wizard__option--selected" : ""}`}
            onClick={() => set("agentRelationship", option.value)}
          >
            <div className="sell-wizard__option-icon">
              <option.Icon size={20} />
            </div>
            <div className="sell-wizard__option-content">
              <div className="sell-wizard__option-text">{option.label}</div>
              <div className="sell-wizard__option-desc">{option.desc}</div>
            </div>
          </div>
        ))}
      </div>

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
