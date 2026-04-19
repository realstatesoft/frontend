import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { FiBell, FiHome, FiMenu, FiSun, FiMoon } from 'react-icons/fi';
import { CiUser } from 'react-icons/ci';
import { IoHomeOutline, IoSettingsOutline, IoLogOutOutline, IoCalendarClearOutline, IoSpeedometerOutline } from 'react-icons/io5';
import { MdFavoriteBorder } from 'react-icons/md';
import { FaRegTrashAlt } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';
import useUIStore from '../../../store/useUIStore';
import styles from './Topbar.module.scss';

export default function Topbar({ extraActions }) {
  const { sidebarCollapsed, toggleSidebar, darkMode, toggleDarkMode } = useUIStore();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
        <Link to="/" className={styles.topbar__homeBtn} title="Volver a inicio">
          <FiHome />
          <span className={styles.topbar__homeBtnText}>Inicio</span>
        </Link>
        <span className={styles.topbar__greeting}>
          Bienvenido, <strong>{user?.email || roleLabel}</strong>
        </span>
      </div>

      <div className={styles.topbar__right}>
        {extraActions}
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
        <div className="profile-dropdown-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className={styles.topbar__avatar}
            onClick={() => setDropdownOpen(o => !o)}
            aria-label="Menú de perfil"
          >
            {initials}
          </button>

          {dropdownOpen && (
            <div className="profile-dropdown-menu">
              <Link to="/profile" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                <CiUser size={17} style={{ flexShrink: 0 }} /> Mi perfil
              </Link>
              <Link to="/properties/me" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                <IoHomeOutline size={16} style={{ flexShrink: 0 }} /> Mis propiedades
              </Link>
              <Link to="/trashcan" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                <FaRegTrashAlt size={14} style={{ flexShrink: 0 }} /> Papelera
              </Link>
              <Link to="/properties/favorites" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                <MdFavoriteBorder size={16} style={{ flexShrink: 0 }} /> Favoritos
              </Link>
              {user?.role === 'AGENT' && (
                <>
                  <Link to="/agent/agenda" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <IoCalendarClearOutline size={16} style={{ flexShrink: 0 }} /> Agenda
                  </Link>
                  <Link to="/agent/dashboard" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <IoSpeedometerOutline size={16} style={{ flexShrink: 0 }} /> Dashboard
                  </Link>
                </>
              )}
              <hr className="profile-dropdown-divider" />
              <Link to="#" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                <IoSettingsOutline size={16} style={{ flexShrink: 0 }} /> Ajustes
              </Link>
              <button className="profile-dropdown-item profile-dropdown-logout" onClick={handleLogout}>
                <IoLogOutOutline size={16} style={{ flexShrink: 0 }} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
