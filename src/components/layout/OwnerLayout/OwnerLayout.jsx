import { Outlet, useLocation } from 'react-router-dom';
import {
  FiGrid, FiHome, FiEye, FiMessageSquare, FiDollarSign
} from 'react-icons/fi';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import useUIStore from '../../../store/useUIStore';
import { OWNER_ROUTES } from '../../../utils/constants';
import styles from './OwnerLayout.module.scss';
import { useAuth } from '../../../hooks/useAuth';
import RoleRedirect from '../../commons/RoleRedirect';
import TourOverlay from '../../common/Tour/TourOverlay';
import TourLauncher from '../../common/Tour/TourLauncher';
import { OWNER_TOUR_STEPS } from '../../../data/tourSteps';

const OWNER_NAV_ITEMS = [
  { section: 'Principal' },
  { to: OWNER_ROUTES.DASHBOARD, icon: <FiGrid />, label: 'Mi Panel' },
  { to: OWNER_ROUTES.PROPERTIES, icon: <FiHome />, label: 'Mis Propiedades' },
  { section: 'Gestión' },
  { to: OWNER_ROUTES.VISITS, icon: <FiEye />, label: 'Visitas' },
  { to: OWNER_ROUTES.OFFERS, icon: <FiDollarSign />, label: 'Ofertas' },
  { section: 'Comunicación' },
  { to: OWNER_ROUTES.MESSAGES, icon: <FiMessageSquare />, label: 'Mensajes' },
];

export default function OwnerLayout() {
  const { user } = useAuth();
  const { sidebarCollapsed } = useUIStore();
  const location = useLocation();

  if (user?.role !== 'OWNER') return <RoleRedirect />;

  const isDashboard = location.pathname === OWNER_ROUTES.DASHBOARD;

  const contentClass = [
    styles.ownerLayout__content,
    sidebarCollapsed && styles['ownerLayout__content--collapsed'],
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.ownerLayout}>
      <Sidebar navItems={OWNER_NAV_ITEMS} />
      <Topbar extraActions={isDashboard ? <TourLauncher tourId="owner" steps={OWNER_TOUR_STEPS} /> : null} />
      <div className={contentClass}>
        <main className={styles.ownerLayout__main}>
          <Outlet />
        </main>
      </div>
      <TourOverlay />
    </div>
  );
}
