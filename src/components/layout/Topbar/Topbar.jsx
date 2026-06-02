import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiBell, FiHome, FiMenu, FiSun, FiMoon } from 'react-icons/fi';
import { CiUser } from 'react-icons/ci';
import { IoSettingsOutline, IoLogOutOutline, IoSpeedometerOutline, IoChatbubblesOutline, IoShieldOutline } from 'react-icons/io5';
import { useAuth } from '../../../hooks/useAuth';
import { useUnreadMessagesCount } from '../../../hooks/useMessagesData';
import useUIStore from '../../../store/useUIStore';
import LanguageSelector from '../../common/LanguageSelector';
import CurrencySelector from '../../common/CurrencySelector';
import styles from './Topbar.module.scss';

export default function Topbar({ extraActions }) {
  const { sidebarCollapsed, toggleSidebar, darkMode, toggleDarkMode } = useUIStore();
 
  const { t } = useTranslation('navigation');
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { data: messagesUnread = 0 } = useUnreadMessagesCount({ enabled: isAuthenticated });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    setDropdownOpen(false);
    logout();
    navigate('/');
  }

  const roleLabel =
    user?.role === 'AGENT'
      ? t('role.agent')
      : user?.role === 'ADMIN'
        ? t('adminPanel')
        : t('role.owner');

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : roleLabel.substring(0, 2).toUpperCase();

  const topbarClass = [
    styles.topbar,
    sidebarCollapsed && styles['topbar--collapsed'],
  ].filter(Boolean).join(' ');

  const getDashboardLink = () => {
    if (user?.role === 'USER') return '/owner/dashboard';
    if (user?.role === 'AGENT') return '/agent/dashboard';
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    return '/dashboard';
  };

  const getSettingsLink = () => {
    if (user?.role === 'AGENT') return '/agent/settings';
    if (user?.role === 'ADMIN') return '/admin/settings';
    return '/owner/settings';
  };

  return (
    <header className={topbarClass}>
      <div className={styles.topbar__left}>
        <button
          type="button"
          className={styles.topbar__menuBtn}
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? t('sidebar.toggleOpen') : t('sidebar.toggleClose')}
        >
          <FiMenu />
        </button>
        <Link to="/" className={styles.topbar__homeBtn} title={t('home')}>
          <FiHome />
          <span className={styles.topbar__homeBtnText}>{t('home')}</span>
        </Link>
        <span className={styles.topbar__greeting}>
          {t('welcome')}, <strong>{user?.email || roleLabel}</strong>
        </span>
      </div>

      <div className={styles.topbar__right}>
        {extraActions}
        <LanguageSelector variant="dark" />
        <CurrencySelector variant="dark" />
        <button
          type="button"
          className={styles.topbar__iconBtn}
          onClick={toggleDarkMode}
          aria-label={darkMode ? t('theme.light') : t('theme.dark')}
        >
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>
        <button
          type="button"
          className={styles.topbar__iconBtn}
          aria-label={t('notifications')}
        >
          <FiBell />
          <span className={styles.topbar__badge} />
        </button>

        {isAuthenticated && (
          <Link
            to={user?.role === 'AGENT' ? '/agent/mensajes' : user?.role === 'USER' || user?.role === 'OWNER' ? '/owner/mensajes' : '/mensajes'}
            className={styles.topbar__iconBtn}
            aria-label="Mensajes"
          >
            <IoChatbubblesOutline />
            {messagesUnread > 0 && (
              <span className={styles.topbar__badge}>
                {messagesUnread > 99 ? '99+' : messagesUnread}
              </span>
            )}
          </Link>
        )}
        <div className="profile-dropdown-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className={styles.topbar__avatar}
            onClick={() => setDropdownOpen(o => !o)}
            aria-label={t('profileMenu')}
          >
            {initials}
          </button>

          {dropdownOpen && (
            <div className="profile-dropdown-menu">
              <Link to="/profile" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                <CiUser size={17} style={{ flexShrink: 0 }} /> {t('myProfile')}
              </Link>
              <Link to={getDashboardLink()} className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                <IoSpeedometerOutline size={16} style={{ flexShrink: 0 }} /> {t('dashboard', 'Mi dashboard')}
              </Link>
              {user?.role !== 'AGENT' && user?.role !== 'ADMIN' && (
                <Link to="/mensajes" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <IoChatbubblesOutline size={16} style={{ flexShrink: 0 }} /> {t('messages')}
                  {messagesUnread > 0 && (
                    <span style={{ marginLeft: 'auto', background: 'var(--color-primary)', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: '0.72rem', fontWeight: 700 }}>
                      {Number(messagesUnread) > 99 ? '99+' : Number(messagesUnread)}
                    </span>
                  )}
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link to="/admin/dashboard" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <IoShieldOutline size={16} style={{ flexShrink: 0 }} /> {t('adminPanel')}
                </Link>
              )}

              <hr className="profile-dropdown-divider" />
              <Link to={getSettingsLink()} className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                <IoSettingsOutline size={16} style={{ flexShrink: 0 }} /> {t('settings')}
              </Link>
              <button className="profile-dropdown-item profile-dropdown-logout" onClick={handleLogout}>
                <IoLogOutOutline size={16} style={{ flexShrink: 0 }} /> {t('logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
