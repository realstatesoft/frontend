import React from "react";
import {
  Lightning,
  Calendar,
  CalendarWeek,
  CalendarRange,
  Search,
  ArrowLeft,
  ArrowRight,
} from "react-bootstrap-icons";

const OPTIONS = [
  { value: "asap", label: "Lo antes posible", Icon: Lightning },
  { value: "1_month", label: "Dentro de 1 mes", Icon: Calendar },
  { value: "2_3_months", label: "2 - 3 meses", Icon: CalendarWeek },
  { value: "4_plus", label: "4 meses o más", Icon: CalendarRange },
  { value: "browsing", label: "Solo estoy explorando", Icon: Search },
];

export default function StepTimeline({ form, set, nextStep, prevStep }) {
  const canContinue = form.timeline !== null;
  const actionWord = form.category === "RENT" ? "alquilar" : "vender";

  return (
    <div className="sell-wizard__step">
      <h2 className="sell-wizard__title">¿Cuándo te gustaría {actionWord}?</h2>
      <p className="sell-wizard__subtitle">
        Esto nos ayuda a encontrar los mejores agentes para tu situación.
      </p>

      <div className="sell-wizard__grid">
        {OPTIONS.map((option) => (
          <div
            key={option.value}
            className={`sell-wizard__card ${form.timeline === option.value ? "sell-wizard__card--selected" : ""}`}
            onClick={() => set("timeline", option.value)}
          >
            <div className="sell-wizard__card-icon">
              <option.Icon size={22} />
            </div>
            <span className="sell-wizard__card-label">{option.label}</span>
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
