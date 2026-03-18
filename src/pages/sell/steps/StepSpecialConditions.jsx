import React from "react";
import { Check, ArrowLeft, ArrowRight } from "react-bootstrap-icons";

const SPECIAL_CONDITIONS = [
  { value: "solar_panels", label: "Paneles solares alquilados o financiados" },
  { value: "foundation_issues", label: "Problemas de cimientos" },
  { value: "fire_damage", label: "Daños por incendio" },
  { value: "septic_system", label: "Sistema séptico (pozo ciego)" },
  { value: "security_system", label: "Sistema de seguridad instalado" },
  { value: "horse_property", label: "Propiedad ecuestre (para caballos)" },
  { value: "mobile_home", label: "Casa móvil o prefabricada" },
  { value: "tenant_occupied", label: "Actualmente con inquilino" },
  { value: "hoa", label: "Parte de un barrio cerrado/HOA" },
  { value: "none", label: "Ninguna de estas aplica" },
];

export default function StepSpecialConditions({ form, set, nextStep, prevStep }) {
  const toggleCondition = (value) => {
    const current = form.specialConditions || [];
    
    if (value === "none") {
      set("specialConditions", current.includes("none") ? [] : ["none"]);
      return;
    }
    
    // Remove "none" if selecting other options
    let updated = current.filter((c) => c !== "none");
    
    if (updated.includes(value)) {
      updated = updated.filter((c) => c !== value);
    } else {
      updated = [...updated, value];
    }
    
    set("specialConditions", updated);
  };

  const isSelected = (value) => (form.specialConditions || []).includes(value);
  const canContinue = (form.specialConditions || []).length > 0;

  return (
    <div className="sell-wizard__step">
      <h2 className="sell-wizard__title">¿Alguna de estas aplica a tu propiedad?</h2>
      <p className="sell-wizard__subtitle">
        Seleccioná todas las que correspondan. Esta información es confidencial.
      </p>

      <div className="sell-wizard__checkboxes">
        {SPECIAL_CONDITIONS.map((cond) => (
          <div
            key={cond.value}
            className={`sell-wizard__checkbox ${isSelected(cond.value) ? "sell-wizard__checkbox--selected" : ""}`}
            onClick={() => toggleCondition(cond.value)}
          >
            <div className="sell-wizard__checkbox-box">
              {isSelected(cond.value) && <Check size={14} />}
            </div>
            <span>{cond.label}</span>
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
