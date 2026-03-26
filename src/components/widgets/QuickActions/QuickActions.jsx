import { Link } from 'react-router-dom';
import { FiUserPlus, FiHome, FiCalendar } from 'react-icons/fi';
import { AGENT_ROUTES } from '../../../utils/constants';
import styles from './QuickActions.module.scss';

const ACTIONS = [
  { label: 'Nuevo Cliente', icon: <FiUserPlus />, to: '/clients/register' },
  { label: 'Nueva Propiedad', icon: <FiHome />, to: '/create-property' },
  { label: 'Agendar Visita', icon: <FiCalendar />, to: AGENT_ROUTES.AGENDA },
];

export default function QuickActions() {
  return (
    <div className={styles.quickActions}>
      <h3 className={styles.quickActions__title}>Acciones Rápidas</h3>
      <div className={styles.quickActions__grid}>
        {ACTIONS.map((action) => (
          <Link key={action.label} to={action.to} className={styles.quickActions__btn}>
            <span className={styles.quickActions__btnIcon}>{action.icon}</span>
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
