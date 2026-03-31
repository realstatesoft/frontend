import {
  FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';
import SidebarItem from './SidebarItem';
import useUIStore from '../../../store/useUIStore';
import styles from './Sidebar.module.scss';

export default function Sidebar({ navItems = [] }) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const sidebarClass = [
    styles.sidebar,
    sidebarCollapsed && styles['sidebar--collapsed'],
  ].filter(Boolean).join(' ');

  return (
    <>
      <aside className={sidebarClass}>
        <div className={styles.sidebar__logo}>
          <span className={styles.sidebar__logo_brand}>
            <span className={styles['sidebar__logo-icon']}>O</span>
            <span className={styles['sidebar__logo-text']}>OpenRoof</span>
          </span>
        </div>

        <nav className={styles.sidebar__nav}>
          {navItems.map((item, idx) =>
            item.section ? (
              <span key={idx} className={styles.sidebar__sectionTitle}>
                {item.section}
              </span>
            ) : (
              <SidebarItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                collapsed={sidebarCollapsed}
              />
            )
          )}
        </nav>

        <div className={styles.sidebar__footer}>
          <button className={styles.sidebar__collapseBtn} onClick={toggleSidebar}>
            {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>
      </aside>
    </>
  );
}
