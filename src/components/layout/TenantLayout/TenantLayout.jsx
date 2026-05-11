import { Outlet, useLocation } from 'react-router-dom';
import {
  FiGrid, FiHome, FiCreditCard, FiTool, FiMessageSquare, FiSettings, FiFileText
} from 'react-icons/fi';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import useUIStore from '../../../store/useUIStore';
import styles from './TenantLayout.module.scss';
import { useAuth } from '../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import RoleRedirect from '../../commons/RoleRedirect';

export default function TenantLayout() {
  const { user } = useAuth();
  const { t } = useTranslation('navigation');
  const { sidebarCollapsed } = useUIStore();
  const location = useLocation();

  // Basic check for role. For now assuming user role is enough if they have a lease, 
  // but usually we might have a specific TENANT flag or just check if it's a standard USER.
  // In this project, 'USER' is used for both tenants and owners.
  if (!user) return <RoleRedirect />;

  const contentClass = [
    styles.tenantLayout__content,
    sidebarCollapsed && styles['tenantLayout__content--collapsed'],
  ].filter(Boolean).join(' ');

  const TENANT_NAV_ITEMS = [
    { section: t('sidebar.sectionMain', 'PRINCIPAL') },
    { to: '/tenant/dashboard', icon: <FiGrid />, label: t('layouts.tenant.dashboard', 'Dashboard') },
    { to: '/tenant/lease', icon: <FiFileText />, label: t('layouts.tenant.lease', 'Mi Contrato') },
    { to: '/tenant/payments', icon: <FiCreditCard />, label: t('layouts.tenant.payments', 'Pagos') },
    { to: '/tenant/maintenance', icon: <FiTool />, label: t('layouts.tenant.maintenance', 'Mantenimiento') },
    { section: t('sidebar.sectionCommunication', 'COMUNICACIÓN') },
    { to: '/tenant/messages', icon: <FiMessageSquare />, label: t('layouts.tenant.messages', 'Mensajes'), showBadge: true },
    { to: '/tenant/settings', icon: <FiSettings />, label: t('layouts.tenant.settings', 'Configuración') },
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
