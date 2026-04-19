import { useEffect } from 'react';
import useTourStore from '../store/useTourStore';
import { TOUR_STORAGE_KEY } from '../data/tourSteps';

export function useAutoStartTour(tourId, steps, delay = 400) {
  const { startTour } = useTourStore();

  useEffect(() => {
    const alreadySeen = localStorage.getItem(TOUR_STORAGE_KEY(tourId));
    if (!alreadySeen) {
      const timer = setTimeout(() => {
        startTour(tourId, steps);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [tourId, steps, delay, startTour]);
}