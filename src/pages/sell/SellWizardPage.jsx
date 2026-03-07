import React from "react";
import { useNavigate } from "react-router-dom";
import { useSellWizard } from "../../hooks/useSellWizard";
import {
  StepAddress,
  StepAgentRelationship,
  StepTimeline,
  StepHomeDetails,
  StepFeatures,
  ConditionSelector,
  StepSpecialConditions,
  StepContact,
  StepSelectAgent,
} from "./steps";
import "./SellWizard.scss";

export default function SellWizardPage() {
  const navigate = useNavigate();
  const {
    currentStep,
    totalSteps,
    progress,
    form,
    set,
    nextStep,
    prevStep,
  } = useSellWizard();

  const handleFinish = (finalForm) => {
    // Redirigir a crear propiedad con los datos precargados
    navigate("/create-property", { state: { sellWizardData: finalForm } });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepAddress
            form={form}
            set={set}
            nextStep={nextStep}
          />
        );

      case 2:
        return (
          <StepAgentRelationship
            form={form}
            set={set}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );

      case 3:
        return (
          <StepTimeline
            form={form}
            set={set}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );

      case 4:
        return (
          <StepHomeDetails
            form={form}
            set={set}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );

      case 5:
        return (
          <StepFeatures
            form={form}
            set={set}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );

      case 6:
        return (
          <ConditionSelector
            title="¿Cómo describirías el exterior de tu propiedad?"
            subtitle="Considerá la fachada, jardín, cerca y áreas exteriores."
            value={form.exteriorCondition}
            onChange={(v) => set("exteriorCondition", v)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      case 7:
        return (
          <ConditionSelector
            title="¿Cómo describirías tu living/sala principal?"
            subtitle="Considerá pisos, paredes, iluminación y acabados."
            value={form.livingRoomCondition}
            onChange={(v) => set("livingRoomCondition", v)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      case 8:
        return (
          <ConditionSelector
            title="¿Cómo describirías tu baño principal?"
            subtitle="Considerá sanitarios, griferías y revestimientos."
            value={form.bathroomCondition}
            onChange={(v) => set("bathroomCondition", v)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      case 9:
        return (
          <ConditionSelector
            title="¿Cómo describirías tu cocina?"
            subtitle="Considerá muebles, electrodomésticos y mesadas."
            value={form.kitchenCondition}
            onChange={(v) => set("kitchenCondition", v)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      case 10:
        return (
          <StepSpecialConditions
            form={form}
            set={set}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );

      case 11:
        return (
          <StepContact
            form={form}
            set={set}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );

      case 12:
        return (
          <StepSelectAgent
            form={form}
            set={set}
            prevStep={prevStep}
            onFinish={handleFinish}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="sell-wizard">
      <header className="sell-wizard__header">
        <div className="sell-wizard__progress-container">
          <div className="sell-wizard__progress-info">
            <span>
              {form.category === "RENT" ? "Alquilar" : "Vender"} tu propiedad
            </span>
            <span>
              Paso {currentStep} de {totalSteps}
            </span>
          </div>
          <div className="sell-wizard__progress-bar">
            <div
              className="sell-wizard__progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className={`sell-wizard__content ${currentStep === 12 ? "sell-wizard__content--wide" : ""}`}>
        {renderStep()}
      </main>
    </div>
  );
}
