import { create } from 'zustand';

const useTourStore = create((set, get) => ({
  isActive: false,
  tourId: null,
  steps: [],
  currentStep: 0,

  startTour: (tourId, steps) =>
    set({ isActive: true, tourId, steps, currentStep: 0 }),

  nextStep: () => {
    const { currentStep, steps } = get();
    if (currentStep + 1 >= steps.length) {
      get().endTour();
    } else {
      set({ currentStep: currentStep + 1 });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) set({ currentStep: currentStep - 1 });
  },

  endTour: () =>
    set({ isActive: false, tourId: null, steps: [], currentStep: 0 }),
}));

export default useTourStore;
