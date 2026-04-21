import { Outlet } from 'react-router-dom';
import { FiGrid, FiCheckSquare, FiFlag, FiFileText, FiShield, FiDollarSign, FiLayers } from 'react-icons/fi';
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
  { to: ADMIN_ROUTES.APPROVAL, icon: <FiCheckSquare />, label: 'Aprobacion de propiedades' },
  { to: ADMIN_ROUTES.AUDIT_LOGS, icon: <FiShield />, label: 'Auditoria' },
  { to: ADMIN_ROUTES.FLAGS, icon: <FiFlag />, label: 'Reportes' },
  { to: ADMIN_ROUTES.DOCUMENTS, icon: <FiFileText />, label: 'Validacion de Documentos' },
  { to: ADMIN_ROUTES.RENT_CONFIG, icon: <FiDollarSign />, label: 'Configuracion de Alquiler' },
  { to: ADMIN_ROUTES.CONTRACT_TEMPLATES, icon: <FiLayers />, label: 'Plantillas de contrato' },
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