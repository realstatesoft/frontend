import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import CustomNavbar from '../../components/Landing/Navbar';
import Footer from '../../components/Landing/Footer';
import notificationApi from '../../services/notifications/notificationApi';
import Pagination from '../../components/properties/Pagination';
import '../../styles/AdminNotifications.scss';

import { 
  IoHomeOutline, 
  IoSettingsOutline, 
  IoNotificationsOutline, 
  IoChatbubbleOutline, 
  IoCalendarOutline, 
  IoCashOutline, 
  IoDocumentTextOutline, 
  IoStarOutline,
  IoMailOutline
} from 'react-icons/io5';

const TYPE_ICONS = {
  PROPERTY: <IoHomeOutline />,
  SYSTEM:   <IoSettingsOutline />,
  ALERT:    <IoNotificationsOutline />,
  MESSAGE:  <IoChatbubbleOutline />,
  VISIT:    <IoCalendarOutline />,
  OFFER:    <IoCashOutline />,
  CONTRACT: <IoDocumentTextOutline />,
  REVIEW:   <IoStarOutline />,
};

const TYPE_LABELS = {
  PROPERTY: 'Propiedades',
  SYSTEM:   'Sistema',
  ALERT:    'Alertas',
  MESSAGE:  'Mensajes',
  VISIT:    'Citas',
  OFFER:    'Ofertas',
  CONTRACT: 'Contratos',
  REVIEW:   'Revisiones',
};

const FILTER_TABS = [
  { key: null,        label: 'Todas' },
  { key: 'UNREAD',    label: 'No leídas' },
  { key: 'READ',      label: 'Leídas' },
  { key: 'PROPERTY',  label: 'Propiedades' },
];

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60)    return 'Hace un momento';
  if (seconds < 3600)  return `Hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
  if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminNotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [filter, setFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const latestFetchRef = useRef(0);

  // ─── Fetch unread count ──────────────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      const count = res?.data?.data?.count ?? res?.data?.count ?? 0;
      setUnreadCount(count);
    } catch (e) {
      console.error('Error al obtener conteo de no leídas:', e);
    }
  }, []);

  // ─── Fetch notifications ────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    const fetchId = ++latestFetchRef.current;
    try {
      setLoading(true);
      setError(null);

      const params = { size: 12, page: Math.max(0, currentPage - 1) };
      if (filter) {
        params.filter = filter;
      }

      const res = await notificationApi.getAll(params);
      if (fetchId !== latestFetchRef.current) return;

      const pageData = res?.data?.data ?? res?.data ?? { content: [], totalPages: 0, totalElements: 0 };
      setNotifications(pageData.content ?? []);
      setTotalPages(pageData.totalPages ?? 0);
      setTotalElements(pageData.totalElements ?? 0);

      fetchUnreadCount();
    } catch (err) {
      if (fetchId !== latestFetchRef.current) return;
      console.error('Error al cargar notificaciones:', err);
      setError('No se pudieron cargar las notificaciones. Intente más tarde.');
    } finally {
      if (fetchId === latestFetchRef.current) setLoading(false);
    }
  }, [filter, currentPage, fetchUnreadCount]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ─── Actions ─────────────────────────────────────────────────
  const handleMarkAsRead = async (id) => {
    try {
      setActionLoading(true);
      await notificationApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (err) {
      console.error(err);
      setError('Error al marcar como leída');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      await notificationApi.markAllAsRead();
      setSuccessMsg('Todas las notificaciones marcadas como leídas');
      setTimeout(() => setSuccessMsg(null), 3000);
      await fetchNotifications();
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (err) {
      console.error(err);
      setError('Error al marcar todas como leídas');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading(true);
      await notificationApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setSuccessMsg('Notificación eliminada');
      setTimeout(() => setSuccessMsg(null), 3000);
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (err) {
      console.error(err);
      setError('Error al eliminar notificación');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (notification) => {
    // If it has a property ID in data, go to the approval page
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else if (notification.data?.propertyId) {
      navigate(`/properties/${notification.data.propertyId}`);
    }
  };

  // Active filter label for display
  const activeFilterLabel = FILTER_TABS.find(t => t.key === filter)?.label || 'Todas';

  return (
    <div className="notifications-page">
      <CustomNavbar />

      <Container className="py-4">
        {/* ── Header ──────────────────────────────────── */}
        <header className="notifications-header">
          <h1>Notificaciones</h1>
          <p className="notifications-subtitle">
            {unreadCount > 0
              ? `Tienes ${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} sin leer`
              : 'No tienes notificaciones pendientes'
            }
          </p>
          {unreadCount > 0 && (
            <div className="header-actions">
              <button
                className="btn-mark-all"
                onClick={handleMarkAllAsRead}
                disabled={actionLoading}
              >
                ✓ Marcar todas como leídas
              </button>
            </div>
          )}
        </header>

        {/* ── Filter Tabs ──────────────────────────────── */}
        <div className="notifications-filters">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key ?? 'all'}
              className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
              onClick={() => {
                setFilter(tab.key);
                setCurrentPage(1);
              }}
            >
              {tab.label}
              {tab.key === null && totalElements > 0 && (
                <span className="filter-count">{totalElements}</span>
              )}
              {tab.key === 'UNREAD' && unreadCount > 0 && (
                <span className="filter-count">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Alerts ───────────────────────────────────── */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
            {error}
          </Alert>
        )}
        {successMsg && (
          <Alert variant="success" dismissible onClose={() => setSuccessMsg(null)} className="mb-3">
            {successMsg}
          </Alert>
        )}

        {/* ── Notification List ────────────────────────── */}
        <section>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Cargando notificaciones...</p>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map(notification => {
              const isUnread = !notification.read;
              const typeIcon = TYPE_ICONS[notification.type] || <IoMailOutline />;
              const typeLabel = TYPE_LABELS[notification.type] || notification.type;

              return (
                <div
                  key={notification.id}
                  className={`notification-card type-${notification.type} ${isUnread ? 'unread' : 'read'}`}
                >
                  {/* Icon */}
                  <div className={`notification-icon icon-${notification.type}`}>
                    {typeIcon}
                  </div>

                  {/* Content */}
                  <div className="notification-content">
                    <div className="notification-badges">
                      <span className={`badge-type badge-${notification.type}`}>
                        {typeLabel}
                      </span>
                      {isUnread && <span className="badge-unread" />}
                    </div>
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{timeAgo(notification.createdAt)}</div>
                  </div>

                  {/* Actions */}
                  <div className="notification-actions">
                    {notification.actionUrl && (
                      <button
                        className="action-link"
                        onClick={() => handleViewDetails(notification)}
                      >
                        Ver detalles
                      </button>
                    )}
                    {isUnread && (
                      <button
                        className="action-link"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={actionLoading}
                      >
                        Marcar como leída
                      </button>
                    )}
                    <button
                      className="action-link action-delete"
                      onClick={() => handleDelete(notification.id)}
                      disabled={actionLoading}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="notifications-empty">
              <div className="empty-icon">
                <IoNotificationsOutline size={48} />
              </div>
              <p className="empty-title">No hay notificaciones</p>
              <p className="empty-message">
                {filter === 'UNREAD'
                  ? 'No tienes notificaciones sin leer.'
                  : filter === 'READ'
                    ? 'No tienes notificaciones leídas.'
                    : filter === 'PROPERTY'
                      ? 'No hay notificaciones de propiedades.'
                      : 'Aún no has recibido ninguna notificación.'
                }
              </p>
            </div>
          )}
        </section>

        {/* ── Pagination ───────────────────────────────── */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </Container>

      <Footer />
    </div>
  );
}
