import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.scss';

export default function SidebarItem({ to, icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `${styles.sidebar__item} ${isActive ? styles['sidebar__item--active'] : ''}`
      }
      title={collapsed ? label : undefined}
    >
      <span className={styles.sidebar__itemIcon}>{icon}</span>
      <span className={styles.sidebar__itemLabel}>{label}</span>
    </NavLink>
  );
}
