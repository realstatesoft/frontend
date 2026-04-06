import { Link } from 'react-router-dom';
import { FiHome, FiEye, FiMessageSquare } from 'react-icons/fi';
import { OWNER_ROUTES } from '../../../utils/constants';
import styles from './OwnerQuickActions.module.scss';

const ACTIONS = [
  { label: 'Nueva Propiedad', icon: <FiHome />, to: '/create-property' },
  { label: 'Ver Visitas', icon: <FiEye />, to: OWNER_ROUTES.VISITS },
  { label: 'Mensajes', icon: <FiMessageSquare />, to: OWNER_ROUTES.MESSAGES },
];

export default function OwnerQuickActions() {
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
