import { Outlet } from 'react-router-dom';
import { FiGrid, FiCheckSquare, FiFlag, FiFileText } from 'react-icons/fi';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import useUIStore from '../../../store/useUIStore';
import { ADMIN_ROUTES } from '../../../utils/constants';
import styles from './AdminLayout.module.scss';
import { useAuth } from '../../../hooks/useAuth';
import RoleRedirect from '../../commons/RoleRedirect';

const ADMIN_NAV_ITEMS = [
  { section: 'Principal' },
  { to: ADMIN_ROUTES.DASHBOARD, icon: <FiGrid />, label: 'Panel' },
  { to: ADMIN_ROUTES.APPROVAL, icon: <FiCheckSquare />, label: 'Aprobación de propiedades' },
  { to: ADMIN_ROUTES.FLAGS, icon: <FiFlag />, label: 'Reportes' },
  { to: ADMIN_ROUTES.DOCUMENTS, icon: <FiFileText />, label: 'Validación de Documentos' },
];

export default function AdminLayout() {
  const { user } = useAuth();
  if (user?.role?.toUpperCase() !== 'ADMIN') {
    return <RoleRedirect />;
  }

  const { sidebarCollapsed } = useUIStore();

  const contentClass = [
    styles.adminLayout__content,
    sidebarCollapsed && styles['adminLayout__content--collapsed'],
  ].filter(Boolean).join(' ');

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
