import { create } from 'zustand';
import { TOUR_STORAGE_KEY } from '../data/tourSteps';

const useTourStore = create((set, get) => ({
  isActive: false,
  tourId: null,
  steps: [],
  currentStep: 0,

  startTour: (tourId, steps) => {
    if (!Array.isArray(steps) || steps.length === 0) {
      return;
    }
    set({ isActive: true, tourId, steps, currentStep: 0 });
  },

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

  endTour: () => {
    const { tourId } = get();
    if (tourId) {
      localStorage.setItem(TOUR_STORAGE_KEY(tourId), 'true');
    }
    set({ isActive: false, tourId: null, steps: [], currentStep: 0 });
  },
}));

export default useTourStore;
