import { FiHelpCircle } from 'react-icons/fi';
import useTourStore from '../../../store/useTourStore';
import { TOUR_STORAGE_KEY } from '../../../data/tourSteps';

export default function TourLauncher({ tourId, steps }) {
  const { startTour } = useTourStore();

  function handleLaunch() {
    localStorage.removeItem(TOUR_STORAGE_KEY(tourId));
    startTour(tourId, steps);
  }

  return (
    <button
      onClick={handleLaunch}
      title="Iniciar tour guiado"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#6c757d',
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: '0.85rem',
        padding: '0.25rem 0.5rem',
        borderRadius: '6px',
      }}
    >
      <FiHelpCircle size={16} />
      Tour guiado
    </button>
  );
}
