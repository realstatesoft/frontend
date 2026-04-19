import { FiHelpCircle } from 'react-icons/fi';
import useTourStore from '../../../store/useTourStore';
import { TOUR_STORAGE_KEY } from '../../../data/tourSteps';
import styles from './TourLauncher.module.scss';

export default function TourLauncher({ tourId, steps }) {
  const { startTour } = useTourStore();

  function handleLaunch() {
    localStorage.removeItem(TOUR_STORAGE_KEY(tourId));
    startTour(tourId, steps);
  }

  return (
    <button
      type="button"
      onClick={handleLaunch}
      aria-label="Iniciar tour guiado"
      className={styles.tourLauncher}
    >
      <FiHelpCircle size={16} />
      Tour guiado
    </button>
  );
}
