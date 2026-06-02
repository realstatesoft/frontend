import { Container, Navbar, Nav, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BoxArrowInRight,
  BoxArrowRight,
  Gear,
  Heart,
  HouseDoor,
  Person,
  Trash,
} from "react-bootstrap-icons";
import { useAuth } from "../../hooks/useAuth";
import useHasPublishedProperties from "../../hooks/useHasPublishedProperties";
import { CiUser } from "react-icons/ci";
import {
  IoHomeOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoLogInOutline,
  IoBookmarkOutline,
  IoCalendarClearOutline,
  IoCalendarOutline,
  IoSpeedometerOutline,
  IoOptionsOutline,
  IoShieldOutline,
  IoNotificationsOutline,
  IoCheckmarkDoneOutline,
  IoChatbubblesOutline,
  IoCashOutline,
  IoHome,
  IoBriefcase,
  IoStarOutline,
} from "react-icons/io5";
import { MdFavoriteBorder } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import Logotipo from "../../assets/Logotipo.png";
import { ADMIN_ROUTES } from "../../utils/constants";
import notificationApi from "../../services/notifications/notificationApi";
import { useUnreadMessagesCount } from "../../hooks/useMessagesData";
import LanguageSelector from "../common/LanguageSelector";
import CurrencySelector from "../common/CurrencySelector";
import { useQueryClient } from "@tanstack/react-query";
import propertyApi from "../../services/properties/propertyApi";

function CustomNavbar() {
  const navigate = useNavigate();
  const { t } = useTranslation('navigation');
  const queryClient = useQueryClient();

  // Obtiene el estado de autenticacion, datos del usuario y funcion de logout del contexto global
  const { isAuthenticated, user, logout } = useAuth();

  // Controla si el dropdown de perfil esta visible
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Ref adjunto al contenedor del dropdown para detectar clics fuera de el
  const dropdownRef = useRef(null);

  // ── Notification badge count for ADMIN ──────────────────────
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Messages unread count ──────────────────────────────
  const { data: messagesUnread = 0 } = useUnreadMessagesCount({ enabled: isAuthenticated });

  // Normalización de roles para comparaciones case-insensitive
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const isAgent = user?.role?.toUpperCase() === "AGENT";

  const hasPublishedProperties = useHasPublishedProperties();

  useEffect(() => {
    const fetchCount = () => {
      if (isAuthenticated && isAdmin) {
        notificationApi.getUnreadCount()
          .then(res => {
            const count = res?.data?.data ?? 0;
            setUnreadCount(count);
          })
          .catch(() => {});
      }
    };

    fetchCount();

    // Escuchar actualizaciones globales de notificaciones
    window.addEventListener('notificationsUpdated', fetchCount);
    return () => window.removeEventListener('notificationsUpdated', fetchCount);
  }, [isAuthenticated, isAdmin]);

  /**
   * Registra un listener global de mousedown para cerrar el dropdown
   * cuando el usuario hace clic en cualquier lugar fuera del contenedor.
   * El listener se elimina al desmontar el componente para evitar fugas de memoria.
   */
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Maneja la accion de cerrar sesion:
   * 1. Cierra el dropdown de perfil.
   * 2. Llama a logout() del contexto, que internamente hace POST /auth/logout y limpia la sesion local.
   * 3. Redirige al usuario a la pagina de inicio.
   */
  function handleLogout() {
    setDropdownOpen(false);
    logout();
    navigate("/");
  }

  /**
   * Redirige al usuario a la pagina de login al hacer clic en "Iniciar sesion".
   */
  function handleLogin() {
    setDropdownOpen(false);
    navigate("/login");
  }

  const getOffersLink = () => {
    const role = user?.role?.toUpperCase();
    if (role === 'AGENT') return '/agent/ofertas';
    if (role === 'OWNER') return '/owner/ofertas';
    return '/ofertas';
  };

  const getSettingsLink = () => {
    const role = user?.role?.toUpperCase();
    if (role === 'ADMIN') return '/admin/settings';
    if (role === 'AGENT') return '/agent/settings';
    return '/owner/settings';
  };



  return (
    <Navbar expand="lg" className="bg-white border-bottom shadow-sm py-2" style={{ zIndex: 1040, borderRadius: "0 0 24px 24px" }}>
      <Container fluid className="px-3 px-lg-5">

        <Navbar.Brand as={Link} to="/" className="fw-bold me-4">
          <img src={Logotipo} alt="OpenRoof" style={{ height: '40px', transform: 'scale(2.3)', transformOrigin: 'left center' }} />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto ms-5 gap-4 fw-semibold" style={{ fontSize: "0.95rem" }}>
            <Nav.Link as={Link} to="/properties" state={{ saleRent: "Venta" }} onMouseEnter={() => {
              queryClient.prefetchQuery({
                queryKey: ["properties", { page: 1, size: 12, search: "", propertyType: undefined, category: "SALE", status: undefined, availability: undefined, minPrice: undefined, maxPrice: undefined, minBedrooms: undefined, minBathrooms: undefined }],
                queryFn: async () => {
                  const res = await propertyApi.getAll({ page: 0, size: 12, category: "SALE" });
                  const pageData = res?.data ? (res.data.data ?? res.data) : { content: [], totalPages: 0, totalElements: 0 };
                  return {
                    properties: pageData.content ?? [],
                    totalPages: Number(pageData.page?.totalPages ?? pageData.totalPages ?? (pageData.content ? Math.ceil(pageData.content.length / 12) : 0)),
                    totalElements: Number(pageData.page?.totalElements ?? pageData.totalElements ?? (pageData.content ? pageData.content.length : 0)),
                  };
                },
                staleTime: 5 * 60 * 1000,
              });
            }}>
              {t('buy') || 'Comprar'}
            </Nav.Link>
            
            <Nav.Link as={Link} to="/properties" state={{ saleRent: "Alquiler" }} onMouseEnter={() => {
              queryClient.prefetchQuery({
                queryKey: ["properties", { page: 1, size: 12, search: "", propertyType: undefined, category: "RENT", status: undefined, availability: undefined, minPrice: undefined, maxPrice: undefined, minBedrooms: undefined, minBathrooms: undefined }],
                queryFn: async () => {
                  const res = await propertyApi.getAll({ page: 0, size: 12, category: "RENT" });
                  const pageData = res?.data ? (res.data.data ?? res.data) : { content: [], totalPages: 0, totalElements: 0 };
                  return {
                    properties: pageData.content ?? [],
                    totalPages: Number(pageData.page?.totalPages ?? pageData.totalPages ?? (pageData.content ? Math.ceil(pageData.content.length / 12) : 0)),
                    totalElements: Number(pageData.page?.totalElements ?? pageData.totalElements ?? (pageData.content ? pageData.content.length : 0)),
                  };
                },
                staleTime: 5 * 60 * 1000,
              });
            }}>
              {t('rent') || 'Alquilar'}
            </Nav.Link>

            <Nav.Link as={Link} to="/property-management">
              {t('sell') || 'Vender'}
            </Nav.Link>

            <Nav.Link as={Link} to="/agents">
              {t('agents') || 'Agentes'}
            </Nav.Link>

            <Nav.Link as={Link} to="/subscriptions">
              {t('subscriptions') || 'Suscripciones'}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>

        {/* Bell icon for ADMIN + Profile icon with dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LanguageSelector />
          <CurrencySelector />

        {isAuthenticated && isAdmin && (
          <Link to="/admin/notifications" className="navbar-notification-bell" aria-label={t('notifications')}>
            <IoNotificationsOutline size={20} />
            {unreadCount > 0 && (
              <span className="bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </Link>
        )}

        {isAuthenticated && messagesUnread > 0 && (
          <Link to="/mensajes" className="navbar-messages-link" aria-label={t('messages')}>
            <IoChatbubblesOutline size={20} />
            <span className="bell-badge">{Number(messagesUnread) > 99 ? '99+' : Number(messagesUnread)}</span>
          </Link>
        )}


        <div className="profile-dropdown-wrapper" ref={dropdownRef}>
          <button
            className="profile-avatar-btn"
            onClick={() => setDropdownOpen((o) => !o)}
            aria-label={t('profileMenu')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </button>

          {dropdownOpen && (
            <div className="profile-dropdown-menu">
              {isAuthenticated ? (
                /* ── Usuario logueado ─────────────────────────── */
                <>
                  {/* Seccion 1: principal */}
                  <Link to="/profile" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <Person size={17} style={{ flexShrink: 0 }} /> {t('myProfile')}
                  </Link>
                  <Link to="/dashboard" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <IoSpeedometerOutline size={16} style={{ flexShrink: 0 }} /> {t('dashboard', 'Mi dashboard')}
                  </Link>
                  <Link to="/properties/me" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <HouseDoor size={16} style={{ flexShrink: 0 }} /> {t('myProperties')}
                  </Link>
                  <Link to="/reservations" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <IoBookmarkOutline size={16} style={{ flexShrink: 0 }} /> {t('myReservations')}
                  </Link>
                  {!isAgent && (
                    <Link to="/mis-agentes" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <IoBriefcase size={16} style={{ flexShrink: 0 }} /> Mis agentes
                    </Link>
                  )}
                  {!isAgent && !isAdmin && (
                    <Link to="/mensajes" className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <IoChatbubblesOutline size={16} style={{ flexShrink: 0 }} /> {t('messages')}
                      {messagesUnread > 0 && (
                        <span style={{ marginLeft: 'auto', background: 'var(--color-primary)', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: '0.72rem', fontWeight: 700 }}>
                          {Number(messagesUnread) > 99 ? '99+' : Number(messagesUnread)}
                        </span>
                      )}
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to={ADMIN_ROUTES.DASHBOARD} className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <IoShieldOutline size={16} style={{ flexShrink: 0 }} /> {t('adminPanel')}
                    </Link>
                  )}

                  <hr className="profile-dropdown-divider" />

                  {/* Seccion 2: configuracion y sesion */}
                  <Link to={getSettingsLink()} className="profile-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <Gear size={16} style={{ flexShrink: 0 }} /> {t('settings')}
                  </Link>
                  <button className="profile-dropdown-item profile-dropdown-logout" onClick={handleLogout}>
                    <BoxArrowRight size={16} style={{ flexShrink: 0 }} /> {t('logout')}
                  </button>
                </>
              ) : (
                /* ── Usuario no logueado ──────────────────────── */
                <button className="profile-dropdown-item" onClick={handleLogin}>
                  <BoxArrowInRight size={16} style={{ flexShrink: 0 }} /> {t('login')}
                </button>
              )}
            </div>
          )}
        </div>

        </div>



      </Container>
    </Navbar>
  );
}

export default CustomNavbar;
