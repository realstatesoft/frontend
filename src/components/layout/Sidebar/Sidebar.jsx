import {
  FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';
import Logotipo from '../../../assets/Logotipo.png';
import SidebarItem from './SidebarItem';
import useUIStore from '../../../store/useUIStore';
import { useConversations } from '../../../hooks/useMessagesData';
import styles from './Sidebar.module.scss';

export default function Sidebar({ navItems = [] }) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { data: convResponse } = useConversations();
  const conversations = Array.isArray(convResponse?.data) ? convResponse.data : Array.isArray(convResponse?.data?.content) ? convResponse.data.content : [];
  const unreadCount = conversations.reduce((sum, c) => sum + (Number(c?.unread) || 0), 0);

  const sidebarClass = [
    styles.sidebar,
    sidebarCollapsed && styles['sidebar--collapsed'],
  ].filter(Boolean).join(' ');

  return (
    <>
      <aside className={sidebarClass} data-tour="sidebar">
        <div className={styles.sidebar__logo}>
          <img
            src={Logotipo}
            alt="OpenRoof"
            className={styles['sidebar__logo-img']}
          />
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
                badge={item.showBadge && unreadCount > 0 ? (
                  <span className={styles.sidebar__badge}>{unreadCount}</span>
                ) : null}
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
