import { Outlet } from 'react-router-dom';
import {
  FiGrid, FiCreditCard, FiTool, FiMessageSquare, FiSettings, FiFileText,
  FiSliders, FiHome as FiHomeOutline, FiRepeat
} from 'react-icons/fi';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import useUIStore from '../../../store/useUIStore';
import styles from './TenantLayout.module.scss';
import { useAuth } from '../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import RoleRedirect from '../../commons/RoleRedirect';
import { TENANT_ROUTES } from '../../../utils/constants';


export default function TenantLayout() {
  const { user } = useAuth();
  const { t } = useTranslation('navigation');
  const { sidebarCollapsed } = useUIStore();

  if (user?.role !== 'USER') return <RoleRedirect />;


  const contentClass = [
    styles.tenantLayout__content,
    sidebarCollapsed && styles['tenantLayout__content--collapsed'],
  ].filter(Boolean).join(' ');

  const TENANT_NAV_ITEMS = [
    { to: '/owner/dashboard', icon: <FiHomeOutline style={{ color: '#2563eb' }} />, label: t('layouts.tenant.ownerDashboard', 'Panel Propietario'), badgeLabel: 'Cambiar' },
    { section: t('sidebar.sectionMain', 'PRINCIPAL') },
    { to: TENANT_ROUTES.DASHBOARD, icon: <FiGrid />, label: t('layouts.tenant.dashboard', 'Dashboard') },
    { to: TENANT_ROUTES.LEASE, icon: <FiFileText />, label: t('layouts.tenant.lease', 'Mi Contrato') },
    { to: TENANT_ROUTES.PAYMENTS, icon: <FiCreditCard />, label: t('layouts.tenant.payments', 'Pagos') },
    { to: TENANT_ROUTES.MAINTENANCE, icon: <FiTool />, label: t('layouts.tenant.maintenance', 'Mantenimiento') },
    { section: t('sidebar.sectionCommunication', 'COMUNICACIÓN') },
    { to: TENANT_ROUTES.MESSAGES, icon: <FiMessageSquare />, label: t('layouts.tenant.messages', 'Mensajes'), showBadge: true },
    { to: TENANT_ROUTES.SETTINGS, icon: <FiSettings />, label: t('layouts.tenant.settings', 'Configuración') },
  ];


  return (
    <div className={styles.tenantLayout}>
      <Sidebar navItems={TENANT_NAV_ITEMS} />
      <Topbar />
      <div className={contentClass}>
        <main className={styles.tenantLayout__main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
