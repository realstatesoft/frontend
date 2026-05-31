import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Card, Spinner, Alert, Badge, Table,
  Pagination, Button, Modal,
} from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { FiStar, FiAlertCircle, FiCalendar, FiClock } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import CustomNavbar from '../../components/Landing/Navbar';
import Footer from '../../components/Landing/Footer';
import subscriptionApi from '../../services/subscriptions/subscriptionApi';
import useFormatters from '../../hooks/useFormatters';
import { buildPageItems, PAGE_ELLIPSIS } from '../../utils/pagination';
import styles from './MySubscriptionsPage.module.scss';

const STATUS_VARIANT = {
  ACTIVE: 'success', PENDING: 'warning', CANCELLED: 'secondary', EXPIRED: 'danger',
};

function safeStatusKey(status) {
  if (typeof status !== 'string' || !status.length) return null;
  return `mySubscriptionsPage.status${status.charAt(0) + status.slice(1).toLowerCase()}`;
}

function ActiveSubscriptionCard({ subscription, onCancel, t, formatDate }) {
  const isPending = subscription.status === 'PENDING';
  const statusKey = safeStatusKey(subscription.status);
  const badgeVariant = STATUS_VARIANT[subscription.status] ?? 'secondary';

  return (
    <Card className={`${styles.activeCard} ${isPending ? styles.activeCardPending : ''}`}>
      <Card.Body>
        <div className={styles.activeHeader}>
          <div className={styles.activeIcon}>
            {isPending ? <FiClock size={22} /> : <FiStar size={22} />}
          </div>
          <div>
            <div className={styles.activeLabel}>
              {isPending ? t('mySubscriptionsPage.cardLabelPending') : t('mySubscriptionsPage.cardLabelActive')}
            </div>
            <h4 className={styles.activePlanName}>{subscription.plan?.name}</h4>
          </div>
          <Badge bg={badgeVariant} className="ms-auto align-self-start">
            {statusKey ? t(statusKey) : subscription.status}
          </Badge>
        </div>

        {subscription.plan?.description && (
          <p className="text-muted small mb-3">{subscription.plan.description}</p>
        )}

        <div className={styles.activeDates}>
          {subscription.startsAt && (
            <div className={styles.dateItem}>
              <FiCalendar size={14} className="me-1" />
              <span>{t('mySubscriptionsPage.dateStart')}: <strong>{formatDate(subscription.startsAt)}</strong></span>
            </div>
          )}
          {subscription.expiresAt && (
            <div className={styles.dateItem}>
              <FiCalendar size={14} className="me-1" />
              <span>{t('mySubscriptionsPage.dateExpiry')}: <strong>{formatDate(subscription.expiresAt)}</strong></span>
            </div>
          )}
        </div>

        {isPending && (
          <Alert variant="warning" className="mb-0 mt-3 d-flex align-items-center gap-2 py-2">
            <FiAlertCircle size={16} />
            {t('mySubscriptionsPage.pendingAlert')}
          </Alert>
        )}

        {subscription.status === 'ACTIVE' && (
          <div className="mt-3">
            <Button variant="outline-danger" size="sm" onClick={() => onCancel(subscription)}>
              {t('mySubscriptionsPage.cancelBtn')}
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

function CancelModal({ show, onHide, onConfirm, cancelling, error, t }) {
  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton>
        <Modal.Title>{t('mySubscriptionsPage.cancelModal.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <p className="mb-0">{t('mySubscriptionsPage.cancelModal.body')}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={cancelling}>
          {t('mySubscriptionsPage.cancelModal.back')}
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={cancelling}>
          {cancelling ? <Spinner animation="border" size="sm" /> : t('mySubscriptionsPage.cancelModal.confirm')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function MySubscriptionsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('navigation');
  const { formatDate } = useFormatters();

  const [activeSubscription, setActiveSubscription] = useState(null);
  const [loadingActive, setLoadingActive] = useState(true);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [cancelModal, setCancelModal] = useState({ open: false, subscription: null });
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const latestHistoryReqRef = useRef(0);

  const loadActive = useCallback(() => {
    setLoadingActive(true);
    subscriptionApi.getMyActiveSubscription()
      .then(res => setActiveSubscription(res?.data?.data ?? null))
      .catch(() => setActiveSubscription(null))
      .finally(() => setLoadingActive(false));
  }, []);

  const loadHistory = useCallback(() => {
    const reqId = ++latestHistoryReqRef.current;
    setLoadingHistory(true);
    setHistoryError(null);
    subscriptionApi.getMySubscriptions({ page, size: 8 })
      .then(res => {
        if (reqId !== latestHistoryReqRef.current) return;
        const data = res?.data?.data;
        setHistory(data?.content ?? []);
        setTotalPages(data?.totalPages ?? 0);
      })
      .catch(() => {
        if (reqId !== latestHistoryReqRef.current) return;
        setHistoryError(t('mySubscriptionsPage.historyError'));
      })
      .finally(() => {
        if (reqId !== latestHistoryReqRef.current) return;
        setLoadingHistory(false);
      });
  }, [page, t]);

  useEffect(() => { loadActive(); }, [loadActive]);
  useEffect(() => { loadHistory(); }, [loadHistory]);

  function openCancel(subscription) {
    setCancelError(null);
    setCancelModal({ open: true, subscription });
  }

  async function handleCancel() {
    setCancelling(true);
    setCancelError(null);
    try {
      await subscriptionApi.cancelSubscription(cancelModal.subscription.id);
      setCancelModal({ open: false, subscription: null });
      setSuccessMsg(t('mySubscriptionsPage.cancelSuccess'));
      loadActive();
      loadHistory();
    } catch (err) {
      setCancelError(err.response?.data?.message ?? t('mySubscriptionsPage.cancelError'));
    } finally {
      setCancelling(false);
    }
  }

  function statusLabel(status) {
    const key = safeStatusKey(status);
    return key ? t(key, status) : (status ?? '');
  }

  const pendingIfNoActive = !activeSubscription && history.find(s => s.status === 'PENDING');
  const displayedActive = activeSubscription ?? pendingIfNoActive ?? null;

  return (
    <>
      <CustomNavbar />
      <Container className={styles.container}>
        <div className="d-flex align-items-center gap-2 mb-4">
          <Button
            variant="light"
            className="d-flex align-items-center gap-1"
            onClick={() => navigate(-1)}
            aria-label={t('mySubscriptionsPage.title')}
          >
            <ArrowLeft size={18} /> {t('mySubscriptions')}
          </Button>
          <h2 className="mb-0 ms-2">{t('mySubscriptionsPage.title')}</h2>
        </div>

        {successMsg && (
          <Alert variant="success" dismissible onClose={() => setSuccessMsg(null)} className="mb-3">
            {successMsg}
          </Alert>
        )}

        {/* ── Suscripción activa / pendiente ─────────────────────────────── */}
        {loadingActive ? (
          <div className="d-flex justify-content-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : displayedActive ? (
          <div className="mb-4">
            <ActiveSubscriptionCard subscription={displayedActive} onCancel={openCancel} t={t} />
          </div>
        ) : (
          <Alert variant="info" className="mb-4 d-flex align-items-center gap-2">
            <FiStar />
            {t('mySubscriptionsPage.noActive')}{' '}
            <Button variant="link" className="p-0 ms-1" onClick={() => navigate('/subscriptions')}>
              {t('mySubscriptionsPage.viewPlansLink')}
            </Button>
          </Alert>
        )}

        {/* ── Historial ──────────────────────────────────────────────────── */}
        <h5 className="fw-semibold mb-3">{t('mySubscriptionsPage.historyTitle')}</h5>

        {loadingHistory && <Spinner animation="border" variant="primary" />}
        {historyError && <Alert variant="danger">{historyError}</Alert>}

        {!loadingHistory && !historyError && history.length === 0 && (
          <Alert variant="light" className="text-muted">
            {t('mySubscriptionsPage.historyEmpty')}
          </Alert>
        )}

        {!loadingHistory && history.length > 0 && (
          <>
            <Card>
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>{t('mySubscriptionsPage.colPlan')}</th>
                    <th>{t('mySubscriptionsPage.colStatus')}</th>
                    <th>{t('mySubscriptionsPage.colStart')}</th>
                    <th>{t('mySubscriptionsPage.colExpiry')}</th>
                    <th>{t('mySubscriptionsPage.colCancelled')}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((s) => (
                    <tr key={s.id}>
                      <td className="fw-semibold align-middle">{s.plan?.name ?? '—'}</td>
                      <td className="align-middle">
                        <Badge bg={STATUS_VARIANT[s.status] ?? 'secondary'}>
                          {statusLabel(s.status)}
                        </Badge>
                      </td>
                      <td className="align-middle text-muted" style={{ whiteSpace: 'nowrap' }}>
                        {s.startsAt ? formatDate(s.startsAt) : '—'}
                      </td>
                      <td className="align-middle text-muted" style={{ whiteSpace: 'nowrap' }}>
                        {s.expiresAt ? formatDate(s.expiresAt) : '—'}
                      </td>
                      <td className="align-middle text-muted" style={{ whiteSpace: 'nowrap' }}>
                        {s.cancelledAt ? formatDate(s.cancelledAt) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>

            {totalPages > 1 && (
              <Pagination className="mt-3 justify-content-center">
                <Pagination.Prev disabled={page === 0} onClick={() => setPage((p) => p - 1)} />
                {buildPageItems(page, totalPages).map((item, idx) =>
                  item === PAGE_ELLIPSIS ? (
                    <Pagination.Ellipsis key={`ellipsis-${idx}`} disabled />
                  ) : (
                    <Pagination.Item key={item} active={item === page} onClick={() => setPage(item)}>
                      {item + 1}
                    </Pagination.Item>
                  )
                )}
                <Pagination.Next disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} />
              </Pagination>
            )}
          </>
        )}
      </Container>
      <Footer />

      <CancelModal
        show={cancelModal.open}
        onHide={() => setCancelModal({ open: false, subscription: null })}
        onConfirm={handleCancel}
        cancelling={cancelling}
        error={cancelError}
        t={t}
      />
    </>
  );
}
