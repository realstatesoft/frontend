import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CustomNavbar from '../../components/Landing/Navbar';
import Footer from '../../components/Landing/Footer';
import notificationApi from '../../services/notifications/notificationApi';
import Pagination from '../../components/properties/Pagination';
import ConfirmDialog from '../../components/commons/ConfirmDialog';
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
  const { t } = useTranslation('admin');
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const latestFetchRef = useRef(0);

  // ─── Fetch unread count ──────────────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      const count = res?.data?.data ?? 0;
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
      setError(t('notifications.loadError'));
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
      
      // Refresh to ensure counts and filters (like UNREAD) are sync'd
      await fetchNotifications();
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (err) {
      console.error(err);
      setError(t('notifications.markReadError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      await notificationApi.markAllAsRead();
      setSuccessMsg(t('notifications.markAllReadSuccess'));
      setTimeout(() => setSuccessMsg(null), 3000);
      await fetchNotifications();
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (err) {
      console.error(err);
      setError(t('notifications.markAllReadError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleFilteredDeleteAll = async () => {
    try {
      setActionLoading(true);
      setShowDeleteConfirm(false);
      
      const params = {};
      if (filter) params.filter = filter;
      
      await notificationApi.deleteAllNotifications(params);
      
      setSuccessMsg(
        filter
          ? t('notifications.deletedFiltered', { label: activeFilterLabel })
          : t('notifications.deletedAll')
      );
      setTimeout(() => setSuccessMsg(null), 3000);
      
      await fetchNotifications();
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (err) {
      console.error(err);
      setError(t('notifications.deleteError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading(true);
      await notificationApi.deleteNotification(id);
      
      // Refresh to ensure counts and pagination are sync'd.
      // If was last item on page and not first page, go back
      if (notifications.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        await fetchNotifications();
      }
      
      setSuccessMsg(t('notifications.deletedOne'));
      setTimeout(() => setSuccessMsg(null), 3000);
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (err) {
      console.error(err);
      setError(t('notifications.deleteOneError'));
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
  const activeFilterLabel = FILTER_TABS.find(t => t.key === filter)?.label || t('notifications.filters.all');

  return (
    <div className="notifications-page">
      <CustomNavbar />

      <Container className="py-4">
        {/* ── Header ──────────────────────────────────── */}
        <header className="notifications-header">
          <h1>{t('notifications.title')}</h1>
          <p className="notifications-subtitle">
            {totalElements > 0
              ? t('notifications.subtitle', { count: totalElements, suffix: totalElements !== 1 ? 'es' : '', unread: unreadCount })
              : t('notifications.empty')
            }
          </p>
          <div className="header-actions">
            {unreadCount > 0 && (
              <button
                className="btn-mark-all"
                onClick={handleMarkAllAsRead}
                disabled={actionLoading}
              >
                {t('notifications.markAllRead')}
              </button>
            )}
            {totalElements > 0 && (
              <button
                className="btn-delete-all"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={actionLoading}
                style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}
              >
                {t('notifications.deleteAll')}
              </button>
            )}
          </div>
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
              <p className="mt-3 text-muted">{t('notifications.loading')}</p>
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
                    {(notification.actionUrl || notification.data?.propertyId) && (
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
              <p className="empty-title">{t('notifications.emptyTitle')}</p>
              <p className="empty-message">
                {filter === 'UNREAD'
                  ? 'No tienes notificaciones sin leer.'
                  : filter === 'READ'
                    ? 'No tienes notificaciones leídas.'
                    : filter === 'PROPERTY'
                      ? t('notifications.emptyProperty')
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

      <ConfirmDialog
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        onConfirm={handleFilteredDeleteAll}
        title="Confirmar eliminación masiva"
        message={filter 
          ? `¿Estás seguro de que deseas eliminar todas las notificaciones de la pestaña "${activeFilterLabel}"? Esta acción no se puede deshacer.`
          : '¿Estás seguro de que deseas eliminar TODAS las notificaciones? Esta acción no se puede deshacer.'
        }
        confirmText="Eliminar todo"
        variant="danger"
        loading={actionLoading}
      />

      <Footer />
    </div>
  );
}
