import { Outlet, useLocation } from 'react-router-dom';
import {
  FiGrid, FiHome, FiEye, FiMessageSquare, FiDollarSign, FiFileText
} from 'react-icons/fi';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import useUIStore from '../../../store/useUIStore';
import { OWNER_ROUTES } from '../../../utils/constants';
import styles from './OwnerLayout.module.scss';
import { useAuth } from '../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import RoleRedirect from '../../commons/RoleRedirect';
import TourOverlay from '../../common/Tour/TourOverlay';
import TourLauncher from '../../common/Tour/TourLauncher';
import { OWNER_TOUR_STEPS } from '../../../data/tourSteps';

export default function OwnerLayout() {
  const { user } = useAuth();
  const { t } = useTranslation('navigation');
  const { sidebarCollapsed } = useUIStore();
  const location = useLocation();

  if (user?.role !== 'USER') return <RoleRedirect />;

  const isDashboard = location.pathname === OWNER_ROUTES.DASHBOARD;

  const contentClass = [
    styles.ownerLayout__content,
    sidebarCollapsed && styles['ownerLayout__content--collapsed'],
  ].filter(Boolean).join(' ');

  const OWNER_NAV_ITEMS = [
    { section: t('sidebar.sectionMain') },
    { to: OWNER_ROUTES.DASHBOARD, icon: <FiGrid />, label: t('layouts.owner.dashboard') },
    { to: OWNER_ROUTES.PROPERTIES, icon: <FiHome />, label: t('layouts.owner.properties') },
    { section: t('sidebar.sectionManagement') },
    { to: OWNER_ROUTES.VISITS, icon: <FiEye />, label: t('layouts.owner.visits') },
    { to: OWNER_ROUTES.OFFERS, icon: <FiDollarSign />, label: t('layouts.owner.offers') },
    { to: OWNER_ROUTES.CONTRACTS, icon: <FiFileText />, label: t('layouts.owner.contracts') },
    { section: t('sidebar.sectionCommunication') },
    { to: OWNER_ROUTES.MESSAGES, icon: <FiMessageSquare />, label: t('layouts.owner.messages'), showBadge: true },
  ];

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
