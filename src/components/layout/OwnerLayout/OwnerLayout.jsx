import { Outlet } from 'react-router-dom';
import {
  FiGrid, FiHome, FiEye, FiMessageSquare,
} from 'react-icons/fi';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import useUIStore from '../../../store/useUIStore';
import { OWNER_ROUTES } from '../../../utils/constants';
import styles from './OwnerLayout.module.scss';

const OWNER_NAV_ITEMS = [
  { section: 'Principal' },
  { to: OWNER_ROUTES.DASHBOARD, icon: <FiGrid />, label: 'Mi Panel' },
  { to: OWNER_ROUTES.PROPERTIES, icon: <FiHome />, label: 'Mis Propiedades' },
  { section: 'Gestión' },
  { to: OWNER_ROUTES.VISITS, icon: <FiEye />, label: 'Visitas' },
  { section: 'Comunicación' },
  { to: OWNER_ROUTES.MESSAGES, icon: <FiMessageSquare />, label: 'Mensajes' },
];

export default function OwnerLayout() {
  const { sidebarCollapsed } = useUIStore();

  const contentClass = [
    styles.ownerLayout__content,
    sidebarCollapsed && styles['ownerLayout__content--collapsed'],
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.ownerLayout}>
      <Sidebar navItems={OWNER_NAV_ITEMS} />
      <Topbar />
      <div className={contentClass}>
        <main className={styles.ownerLayout__main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
