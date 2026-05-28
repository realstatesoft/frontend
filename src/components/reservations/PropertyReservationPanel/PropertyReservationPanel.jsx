import { useState, useEffect, useCallback } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import {
  BookmarkPlus, ClipboardCheck, EnvelopeOpen,
  Send, XCircle, CheckCircleFill, Clock, PersonFill,
} from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import reservationApi from '../../../services/reservations/reservationApi';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { statusLabel } from '../../../utils/reservationStatus';
import ReserveModal from '../ReserveModal/ReserveModal';
import styles from './PropertyReservationPanel.module.scss';
import { useTranslation } from 'react-i18next';

const BLOCKING = new Set(['PENDING', 'ACTIVE']);

const STATUS_BG = {
  PENDING:               { background: '#fff3cd', color: '#856404', border: '1px solid #ffc107' },
  ACTIVE:                { background: '#d1e7dd', color: '#0a3622', border: '1px solid #a3cfbb' },
  CANCELLED:             { background: '#e9ecef', color: '#495057', border: '1px solid #ced4da' },
  EXPIRED:               { background: '#e9ecef', color: '#495057', border: '1px solid #ced4da' },
  CONVERTED_TO_CONTRACT: { background: '#cfe2ff', color: '#084298', border: '1px solid #9ec5fe' },
};

export default function PropertyReservationPanel({ property, currentUser, defaultPercent }) {
  const { t } = useTranslation('reservations');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [myReservation, setMyReservation] = useState(null);

  const isOwner = Boolean(currentUser?.userId) && Boolean(property?.ownerId)
    && currentUser.userId === property.ownerId;
  const canManage = Boolean(currentUser?.userId) && Boolean(property?.id)
    && (isOwner || currentUser.role === 'ADMIN');
  const canReserve = currentUser?.role === 'USER' && !isOwner && property?.status === 'PUBLISHED';

  const refresh = useCallback(async () => {
    if (!canManage) return;
    setLoading(true);
    setError(null);
    try {
      const res = await reservationApi.getByProperty(property.id);
      setReservations(res.data?.data ?? []);
    } catch (err) {
      if (err?.response?.status !== 404) setError(t('panel.loadError'));
    } finally {
      setLoading(false);
    }
  }, [canManage, property?.id, t]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!canReserve || !property?.id) return;
    let cancelled = false;
    reservationApi.getMyForProperty(property.id)
      .then((res) => { if (!cancelled) setMyReservation(res.data?.data ?? null); })
      .catch(() => { if (!cancelled) setMyReservation(null); });
    return () => { cancelled = true; };
  }, [canReserve, property?.id]);

  if (property?.status !== 'PUBLISHED') return null;
  if (property?.category !== 'RENT' && property?.category !== 'SALE_OR_RENT') return null;

  const pending = reservations.find((r) => BLOCKING.has(r.status));

  const handleConfirm = async (id) => {
    try {
      await reservationApi.confirm(id);
    } catch {
      setError(t('panel.confirmError'));
      return;
    }
    refresh();
  };

  const askReason = (title) => Swal.fire({
    title,
    input: 'textarea',
    inputPlaceholder: 'Escribí el motivo...',
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc3545',
  });

  const handleReject = async (id) => {
    const { value: reason, isConfirmed } = await askReason('Motivo de rechazo');
    if (!isConfirmed) return;
    try {
      await reservationApi.cancel(id, { reason: reason ?? '' });
      refresh();
    } catch {
      setError(t('panel.rejectError'));
    }
  };

  const handleCancelMine = async (id) => {
    const { value: reason, isConfirmed } = await askReason('¿Cancelar tu reserva?');
    if (!isConfirmed) return;
    try {
      await reservationApi.cancel(id, { reason: reason ?? '' });
      setMyReservation(null);
    } catch {
      setError(t('panel.cancelError'));
    }
  };

  const suggestedAmount = property?.price && defaultPercent
    ? formatCurrency(Number(((Number(property.price) * Number(defaultPercent)) / 100).toFixed(2)))
    : null;

  return (
    <div className={styles.panel}>
      {error && <Alert variant="danger" className="mb-2">{error}</Alert>}
      {loading && <Spinner animation="border" size="sm" className="d-block mb-2" />}

      {canReserve && !myReservation && !pending && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <BookmarkPlus size={20} className={styles.iconPrimary} />
            <span className={styles.cardTitle}>Reservar esta propiedad</span>
          </div>
          <p className={styles.cardSubtitle}>
            Bloqueá esta propiedad mientras coordinás los detalles. El dueño deberá confirmar tu solicitud.
          </p>
          {suggestedAmount && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Monto sugerido ({defaultPercent}%)</span>
              <span className={styles.infoValue}>{suggestedAmount}</span>
            </div>
          )}
          <button className={styles.btnPrimary} onClick={() => setShowModal(true)}>
            <Send size={14} /> Enviar solicitud de reserva
          </button>
        </div>
      )}

      {canReserve && !myReservation && pending && (
        <div className={styles.card}>
          <Alert variant="info" className="mb-0">{t('panel.active')}</Alert>
        </div>
      )}

      {canReserve && myReservation && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <ClipboardCheck size={20} className={styles.iconSuccess} />
            <span className={styles.cardTitle}>Tu solicitud de reserva</span>
          </div>
          <div className={styles.statusBox} style={STATUS_BG[myReservation.status] ?? STATUS_BG.CANCELLED}>
            <div className={styles.statusRow}>
              <span className={styles.statusRowLabel}><Clock size={12} /> Estado</span>
              <span className={styles.statusBadge} style={STATUS_BG[myReservation.status] ?? STATUS_BG.CANCELLED}>
                {statusLabel(myReservation.status)}
              </span>
            </div>
            <div className={styles.statusRow}>
              <span className={styles.statusRowLabel}>Monto</span>
              <strong>{formatCurrency(myReservation.amount)}</strong>
            </div>
            {myReservation.expiresAt && (
              <div className={styles.statusRow}>
                <span className={styles.statusRowLabel}><Clock size={12} /> Expira</span>
                <span>{formatDate(myReservation.expiresAt)}</span>
              </div>
            )}
          </div>
          {(myReservation.status === 'PENDING' || myReservation.status === 'ACTIVE') && (
            <button className={styles.btnDanger} onClick={() => handleCancelMine(myReservation.id)}>
              <XCircle size={14} /> Cancelar mi solicitud
            </button>
          )}
        </div>
      )}

      {canManage && pending && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <EnvelopeOpen size={20} className={styles.iconWarning} />
            <span className={styles.cardTitle}>Solicitud recibida</span>
            <span className={styles.badge} style={STATUS_BG[pending.status] ?? STATUS_BG.PENDING}>
              {statusLabel(pending.status)}
            </span>
          </div>
          <div className={styles.buyerRow}>
            <div className={styles.avatar}><PersonFill size={18} /></div>
            <div>
              <div className={styles.buyerName}>{pending.buyerName}</div>
              <div className={styles.buyerEmail}>{pending.buyerEmail}</div>
            </div>
            <div className={styles.amount}>
              <span className={styles.amountLabel}>Monto ofrecido</span>
              <strong className={styles.amountValue}>{formatCurrency(pending.amount)}</strong>
            </div>
          </div>
          <div className={styles.actionRow}>
            {pending.status === 'PENDING' && (
              <button className={styles.btnSuccess} onClick={() => handleConfirm(pending.id)}>
                <CheckCircleFill size={14} /> Confirmar
              </button>
            )}
            {pending.status === 'PENDING' && (
              <button className={styles.btnOutlineDanger} onClick={() => handleReject(pending.id)}>
                <XCircle size={14} /> Rechazar
              </button>
            )}
            {pending.status === 'ACTIVE' && (
              <button className={styles.btnOutlineDanger} onClick={() => handleReject(pending.id)}>
                <XCircle size={14} /> Cancelar reserva
              </button>
            )}
          </div>
        </div>
      )}

      <ReserveModal
        show={showModal}
        property={property}
        defaultPercent={defaultPercent}
        onClose={() => setShowModal(false)}
        onCreated={async (created) => {
          setMyReservation(created ?? null);
          await Swal.fire({
            icon: 'success',
            title: t('panel.sentTitle'),
            text: created?.amount != null
              ? `Tu reserva por ${formatCurrency(created.amount)} quedó en estado ${created.status}.`
              : t('panel.sentText'),
            timer: 2000,
            showConfirmButton: false,
          });
          refresh();
        }}
      />
    </div>
  );
}
