import { Outlet } from 'react-router-dom';
import { FiGrid, FiCheckSquare, FiFlag, FiFileText, FiShield, FiDollarSign, FiLayers } from 'react-icons/fi';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import useUIStore from '../../../store/useUIStore';
import { ADMIN_ROUTES } from '../../../utils/constants';
import styles from './AdminLayout.module.scss';
import { useAuth } from '../../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import RoleRedirect from '../../commons/RoleRedirect';


export default function AdminLayout() {
  const { user } = useAuth();
  const { t } = useTranslation('navigation');
  if (user?.role?.toUpperCase() !== 'ADMIN') {
    return <RoleRedirect />;
  }

  const { sidebarCollapsed } = useUIStore();

  const contentClass = [
    styles.adminLayout__content,
    sidebarCollapsed && styles['adminLayout__content--collapsed'],
  ].filter(Boolean).join(' ');

  const ADMIN_NAV_ITEMS = [
    { section: t('sidebar.sectionMain') },
    { to: ADMIN_ROUTES.DASHBOARD, icon: <FiGrid />, label: t('layouts.admin.dashboard') },
    { to: ADMIN_ROUTES.APPROVAL, icon: <FiCheckSquare />, label: t('layouts.admin.approval') },
    { to: ADMIN_ROUTES.PAYMENTS, icon: <FiDollarSign />, label: t('layouts.admin.payments') },
    { to: ADMIN_ROUTES.AUDIT_LOGS, icon: <FiShield />, label: t('layouts.admin.auditLogs') },
    { to: ADMIN_ROUTES.FLAGS, icon: <FiFlag />, label: t('layouts.admin.reports') },
    { to: ADMIN_ROUTES.DOCUMENTS, icon: <FiFileText />, label: t('layouts.admin.documents') },
    { to: ADMIN_ROUTES.RENT_CONFIG, icon: <FiDollarSign />, label: t('layouts.admin.rentConfig') },
    { to: ADMIN_ROUTES.CONTRACT_TEMPLATES, icon: <FiLayers />, label: t('layouts.admin.contractTemplates') },
  ];

  return (
    <div className={styles.adminLayout}>
      <Sidebar navItems={ADMIN_NAV_ITEMS} />
      <Topbar />
      <div className={contentClass}>
        <main className={styles.adminLayout__main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
