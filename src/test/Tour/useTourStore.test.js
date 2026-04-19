import { describe, it, expect, beforeEach } from 'vitest';
import { act } from 'react';
import useTourStore from '../../store/useTourStore';

const STEPS = [
  { id: 'welcome', target: null, title: 'Bienvenido', content: 'Hola' },
  { id: 'sidebar', target: '[data-tour="sidebar"]', title: 'Navegación', content: 'Usa el menú' },
];

beforeEach(() => {
  act(() => {
    useTourStore.setState({ isActive: false, currentStep: 0, steps: [], tourId: null });
  });
});

describe('useTourStore', () => {
  it('starts a tour and sets steps', () => {
    act(() => useTourStore.getState().startTour('agent', STEPS));
    const state = useTourStore.getState();
    expect(state.isActive).toBe(true);
    expect(state.tourId).toBe('agent');
    expect(state.steps).toEqual(STEPS);
    expect(state.currentStep).toBe(0);
  });

  it('nextStep advances the step', () => {
    act(() => useTourStore.getState().startTour('agent', STEPS));
    act(() => useTourStore.getState().nextStep());
    expect(useTourStore.getState().currentStep).toBe(1);
  });

  it('nextStep on last step ends the tour', () => {
    act(() => useTourStore.getState().startTour('agent', STEPS));
    act(() => useTourStore.getState().nextStep()); // step 1
    act(() => useTourStore.getState().nextStep()); // past end → endTour
    expect(useTourStore.getState().isActive).toBe(false);
  });

  it('prevStep goes back', () => {
    act(() => useTourStore.getState().startTour('agent', STEPS));
    act(() => useTourStore.getState().nextStep());
    act(() => useTourStore.getState().prevStep());
    expect(useTourStore.getState().currentStep).toBe(0);
  });

  it('prevStep does nothing on first step', () => {
    act(() => useTourStore.getState().startTour('agent', STEPS));
    act(() => useTourStore.getState().prevStep());
    expect(useTourStore.getState().currentStep).toBe(0);
  });

  it('endTour resets state', () => {
    act(() => useTourStore.getState().startTour('agent', STEPS));
    act(() => useTourStore.getState().endTour());
    const state = useTourStore.getState();
    expect(state.isActive).toBe(false);
    expect(state.currentStep).toBe(0);
    expect(state.tourId).toBe(null);
    expect(state.steps).toEqual([]);
  });
});
