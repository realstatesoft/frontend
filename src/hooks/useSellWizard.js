import { useState, useCallback, useEffect } from "react";

const INITIAL_STATE = {
  // Step 1: Address & Location
  address: "",
  geolocation: null,
  latitude: null,
  longitude: null,
  
  // Step 2: Agent relationship
  agentRelationship: null, // 'agent_for_owner' | 'agent_and_owner' | 'builder' | 'signed_agreement' | 'none'
  
  // Step 3: Timeline
  timeline: null, // 'asap' | '1_month' | '2_3_months' | '4_plus' | 'browsing'
  
  // Step 4: Home details
  propertyType: "HOUSE",
  category: "SALE", // 'SALE' | 'RENT'
  surfaceArea: "",
  builtArea: "",
  yearBuilt: "",
  bedrooms: 0,
  threeQuarterBath: 0,
  halfBath: 0,
  floors: 1,
  
  // Step 5: Features
  hasPool: null,
  parkingSpaces: 0,
  hasSecureEntry: null,
  hasBasement: null,
  basementArea: "",
  
  // Step 6: Condition - Exterior
  exteriorCondition: null, // 'fixer_upper' | 'dated' | 'standard' | 'high_end' | 'luxury'
  
  // Step 7: Condition - Living Room
  livingRoomCondition: null,
  
  // Step 8: Condition - Bathroom
  bathroomCondition: null,
  
  // Step 9: Condition - Kitchen
  kitchenCondition: null,
  countertopType: null,
  
  // Step 10: HOA & Special conditions
  hasHOA: null,
  specialConditions: [],
  
  // Step 11: Contact info
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  
  // Final: Selected agent
  selectedAgentId: null,
};

const TOTAL_STEPS = 12;
const FORM_STORAGE_KEY = "sellWizardForm";

// ── Safe storage helpers ──────────────────────────────────────────────────────
// Best-effort: never throw so the wizard keeps working when storage is blocked
// (e.g. private browsing restrictions, quota exceeded, sandboxed iframes).
const safeGetItem = (key) => {
  try { return sessionStorage.getItem(key); } catch (_) { return null; }
};
const safeSetItem = (key, value) => {
  try { sessionStorage.setItem(key, value); } catch (_) { /* ignore */ }
};
const safeRemoveItem = (key) => {
  try { sessionStorage.removeItem(key); } catch (_) { /* ignore */ }
};

export function useSellWizard() {
  const [currentStep, setCurrentStep] = useState(() => {
    const returnStep = safeGetItem("wizardReturnStep");
    if (returnStep) {
      const step = parseInt(returnStep, 10);
      if (!isNaN(step) && step >= 1 && step <= TOTAL_STEPS) {
        return step;
      }
    }
    return 1;
  });

  // Restore form from sessionStorage so navigation to /AgentSearch and back
  // doesn't wipe out the user's entered data.
  const [form, setForm] = useState(() => {
    try {
      const saved = safeGetItem(FORM_STORAGE_KEY);
      if (saved) return { ...INITIAL_STATE, ...JSON.parse(saved) };
    } catch (_) { /* ignore parse errors */ }
    return INITIAL_STATE;
  });

  const [loading, setLoading] = useState(false);

  // Persist form on every change (best-effort)
  useEffect(() => {
    safeSetItem(FORM_STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  const set = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setMultiple = useCallback((updates) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goToStep = useCallback((step) => {
    setCurrentStep(Math.max(1, Math.min(step, TOTAL_STEPS)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const reset = useCallback(() => {
    setForm(INITIAL_STATE);
    setCurrentStep(1);
    safeRemoveItem(FORM_STORAGE_KEY);
    safeRemoveItem("wizardReturnStep");
    safeRemoveItem("selectedAgentFromSearch");
  }, []);

  const progress = Math.round((currentStep / TOTAL_STEPS) * 100);

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    progress,
    form,
    set,
    setMultiple,
    nextStep,
    prevStep,
    goToStep,
    reset,
    loading,
    setLoading,
  };
}

export default useSellWizard;
