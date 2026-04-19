import { Outlet, useLocation } from 'react-router-dom';
import {
  FiGrid, FiUsers, FiHome, FiCalendar,
  FiDollarSign, FiBarChart2, FiMessageSquare, FiClipboard, FiFileText, FiUser
} from 'react-icons/fi';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import useUIStore from '../../../store/useUIStore';
import { AGENT_ROUTES } from '../../../utils/constants';
import styles from './AgentLayout.module.scss';
import { useAuth } from '../../../hooks/useAuth';
import RoleRedirect from '../../commons/RoleRedirect';
import TourOverlay from '../../common/Tour/TourOverlay';
import TourLauncher from '../../common/Tour/TourLauncher';
import { AGENT_TOUR_STEPS } from '../../../data/tourSteps';

const AGENT_NAV_ITEMS = [
  { section: 'Principal' },
  { to: '/agent/perfil', icon: <FiUser />, label: 'Mi Perfil' },
  { to: AGENT_ROUTES.DASHBOARD, icon: <FiGrid />, label: 'Dashboard' },
  { to: AGENT_ROUTES.CLIENTS, icon: <FiUsers />, label: 'Clientes' },
  { to: AGENT_ROUTES.PROPERTIES, icon: <FiHome />, label: 'Propiedades' },
  { to: AGENT_ROUTES.VISIT_REQUESTS, icon: <FiClipboard />, label: 'Solicitudes de Visita' },
  { section: 'Gestión' },
  { to: AGENT_ROUTES.AGENDA, icon: <FiCalendar />, label: 'Agenda' },
  { to: AGENT_ROUTES.SALES, icon: <FiDollarSign />, label: 'Ventas' },
  { to: AGENT_ROUTES.CONTRACTS, icon: <FiFileText />, label: 'Contratos' },
  { to: AGENT_ROUTES.REPORTS, icon: <FiBarChart2 />, label: 'Reportes' },
  { section: 'Comunicación' },
  { to: AGENT_ROUTES.MESSAGES, icon: <FiMessageSquare />, label: 'Mensajes', showBadge: true },
];

export default function AgentLayout() {
  const { user } = useAuth();
  const { sidebarCollapsed } = useUIStore();
  const location = useLocation();

  if (user?.role !== 'AGENT') return <RoleRedirect />;

  const isDashboard = location.pathname === AGENT_ROUTES.DASHBOARD;

  const contentClass = [
    styles.agentLayout__content,
    sidebarCollapsed && styles['agentLayout__content--collapsed'],
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.agentLayout}>
      <Sidebar navItems={AGENT_NAV_ITEMS} />
      <Topbar extraActions={isDashboard ? <TourLauncher tourId="agent" steps={AGENT_TOUR_STEPS} /> : null} />
      <div className={contentClass}>
        <main className={styles.agentLayout__main}>
          <Outlet />
        </main>
      </div>
      <TourOverlay />
    </div>
  );
}
