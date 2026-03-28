import { Outlet } from 'react-router-dom';
import {
  FiGrid, FiUsers, FiHome, FiCalendar,
  FiDollarSign, FiBarChart2, FiMessageSquare, FiClipboard,
} from 'react-icons/fi';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import useUIStore from '../../../store/useUIStore';
import { AGENT_ROUTES } from '../../../utils/constants';
import styles from './AgentLayout.module.scss';
import { useAuth } from '../../../hooks/useAuth';
import RoleRedirect from '../../commons/RoleRedirect';

const AGENT_NAV_ITEMS = [
  { section: 'Principal' },
  { to: AGENT_ROUTES.DASHBOARD, icon: <FiGrid />, label: 'Dashboard' },
  { to: AGENT_ROUTES.CLIENTS, icon: <FiUsers />, label: 'Clientes' },
  { to: AGENT_ROUTES.PROPERTIES, icon: <FiHome />, label: 'Propiedades' },
  { to: AGENT_ROUTES.VISIT_REQUESTS, icon: <FiClipboard />, label: 'Solicitudes de Visita' },
  { section: 'Gestión' },
  { to: AGENT_ROUTES.AGENDA, icon: <FiCalendar />, label: 'Agenda' },
  { to: AGENT_ROUTES.SALES, icon: <FiDollarSign />, label: 'Ventas' },
  { to: AGENT_ROUTES.REPORTS, icon: <FiBarChart2 />, label: 'Reportes' },
  { section: 'Comunicación' },
  { to: AGENT_ROUTES.MESSAGES, icon: <FiMessageSquare />, label: 'Mensajes' },
];

export default function AgentLayout() {
  const { user } = useAuth();
  // If authenticated user is not an agent, redirect using RoleRedirect
  if (user?.role !== 'AGENT') {
    return <RoleRedirect />;
  }
  const { sidebarCollapsed } = useUIStore();

  const contentClass = [
    styles.agentLayout__content,
    sidebarCollapsed && styles['agentLayout__content--collapsed'],
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.agentLayout}>
      <Sidebar navItems={AGENT_NAV_ITEMS} />
      <Topbar />
      <div className={contentClass}>
        <main className={styles.agentLayout__main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
