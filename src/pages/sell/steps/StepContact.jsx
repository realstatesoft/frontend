import React from "react";
import { Person, Telephone, Envelope, ArrowLeft, ArrowRight } from "react-bootstrap-icons";

export default function StepContact({ form, set, nextStep, prevStep }) {
  const canContinue =
    form.firstName.trim().length >= 2 &&
    form.lastName.trim().length >= 2 &&
    form.phone.trim().length >= 8;

  return (
    <div className="sell-wizard__step">
      <h2 className="sell-wizard__title">¿Cómo podemos contactarte?</h2>
      <p className="sell-wizard__subtitle">
        Ingresá tus datos para que los agentes puedan comunicarse con vos.
      </p>

      <div className="sell-wizard__form-group">
        <label className="sell-wizard__label">
          <Person size={16} /> Nombre
        </label>
        <input
          type="text"
          className="sell-wizard__input"
          placeholder="Tu nombre"
          value={form.firstName}
          onChange={(e) => set("firstName", e.target.value)}
        />
      </div>

      <div className="sell-wizard__form-group">
        <label className="sell-wizard__label">
          <Person size={16} /> Apellido
        </label>
        <input
          type="text"
          className="sell-wizard__input"
          placeholder="Tu apellido"
          value={form.lastName}
          onChange={(e) => set("lastName", e.target.value)}
        />
      </div>

      <div className="sell-wizard__form-group">
        <label className="sell-wizard__label">
          <Telephone size={16} /> Teléfono
        </label>
        <input
          type="tel"
          className="sell-wizard__input"
          placeholder="+595 981 123 456"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
      </div>

      <div className="sell-wizard__form-group">
        <label className="sell-wizard__label">
          <Envelope size={16} /> Email (opcional)
        </label>
        <input
          type="email"
          className="sell-wizard__input"
          placeholder="tu@email.com"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
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
          Ver agentes sugeridos <ArrowRight />
        </button>
      </div>
    </div>
  );
}
