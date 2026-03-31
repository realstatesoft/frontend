import { FiBell, FiMenu, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../../../hooks/useAuth';
import useUIStore from '../../../store/useUIStore';
import styles from './Topbar.module.scss';

export default function Topbar() {
  const { sidebarCollapsed, toggleSidebar, darkMode, toggleDarkMode } = useUIStore();
  const { user } = useAuth();

  const roleLabel = user?.role === 'AGENT' ? 'Agente' : 'Propietario';

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : roleLabel.substring(0, 2).toUpperCase();

  const topbarClass = [
    styles.topbar,
    sidebarCollapsed && styles['topbar--collapsed'],
  ].filter(Boolean).join(' ');

  return (
    <header className={topbarClass}>
      <div className={styles.topbar__left}>
        <button
          type="button"
          className={styles.topbar__menuBtn}
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Abrir menú" : "Cerrar menú"}
        >
          <FiMenu />
        </button>
        <span className={styles.topbar__greeting}>
          Bienvenido, <strong>{user?.email || roleLabel}</strong>
        </span>
      </div>

      <div className={styles.topbar__right}>
        <button
          type="button"
          className={styles.topbar__iconBtn}
          onClick={toggleDarkMode}
          aria-label={darkMode ? 'Pasar a modo claro' : 'Pasar a modo oscuro'}
        >
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>
        <button
          type="button"
          className={styles.topbar__iconBtn}
          aria-label="Notificaciones"
        >
          <FiBell />
          <span className={styles.topbar__badge} />
        </button>
        <div className={styles.topbar__avatar}>
          {initials}
        </div>
      </div>
    </header>
  );
}
