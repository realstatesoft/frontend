import { Outlet, useLocation } from 'react-router-dom';
import {
  FiGrid, FiUsers, FiHome, FiCalendar,
  FiDollarSign, FiBarChart2, FiMessageSquare, FiClipboard, FiFileText, FiUser, FiTarget, FiGitBranch,
} from 'react-icons/fi';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import useUIStore from '../../../store/useUIStore';
import { AGENT_ROUTES } from '../../../utils/constants';
import styles from './AgentLayout.module.scss';
import { useAuth } from '../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import RoleRedirect from '../../commons/RoleRedirect';
import TourOverlay from '../../common/Tour/TourOverlay';
import TourLauncher from '../../common/Tour/TourLauncher';
import { AGENT_TOUR_STEPS } from '../../../data/tourSteps';

export default function AgentLayout() {
  const { user } = useAuth();
  const { t } = useTranslation('navigation');
  const { sidebarCollapsed } = useUIStore();
  const location = useLocation();

  if (user?.role !== 'AGENT') return <RoleRedirect />;

  const isDashboard = location.pathname === AGENT_ROUTES.DASHBOARD;

  const contentClass = [
    styles.agentLayout__content,
    sidebarCollapsed && styles['agentLayout__content--collapsed'],
  ].filter(Boolean).join(' ');

  const AGENT_NAV_ITEMS = [
    { section: t('sidebar.sectionMain') },
    { to: '/agent/perfil', icon: <FiUser />, label: t('layouts.agent.profile') },
    { to: AGENT_ROUTES.DASHBOARD, icon: <FiGrid />, label: t('layouts.agent.dashboard') },
    { to: AGENT_ROUTES.CLIENTS, icon: <FiUsers />, label: t('layouts.agent.clients') },
    { to: AGENT_ROUTES.PROPERTIES, icon: <FiHome />, label: t('layouts.agent.properties') },
    { to: AGENT_ROUTES.VISIT_REQUESTS, icon: <FiClipboard />, label: t('layouts.agent.visitRequests') },
    { to: AGENT_ROUTES.LEADS, icon: <FiTarget />, label: t('layouts.agent.leads') },
    { to: AGENT_ROUTES.OFFERS, icon: <FiDollarSign />, label: t('layouts.agent.offers') },
    { section: t('sidebar.sectionManagement') },
    { to: AGENT_ROUTES.AGENDA, icon: <FiCalendar />, label: t('layouts.agent.agenda') },
    { to: AGENT_ROUTES.SALES, icon: <FiDollarSign />, label: t('layouts.agent.sales') },
    { to: AGENT_ROUTES.CONTRACTS, icon: <FiFileText />, label: t('layouts.agent.contracts') },
    { to: AGENT_ROUTES.REPORTS, icon: <FiBarChart2 />, label: t('layouts.agent.reports') },
    { to: AGENT_ROUTES.FUNNEL, icon: <FiGitBranch />, label: t('layouts.agent.funnel') },
    { section: t('sidebar.sectionCommunication') },
    { to: AGENT_ROUTES.MESSAGES, icon: <FiMessageSquare />, label: t('layouts.agent.messages'), showBadge: true },
  ];

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
