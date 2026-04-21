import { useState, useEffect, useCallback } from 'react';
import { Button, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import Swal from 'sweetalert2';
import reservationApi from '../../../services/reservations/reservationApi';
import { formatCurrency } from '../../../utils/formatters';
import { statusVariant, statusLabel } from '../../../utils/reservationStatus';
import ReserveModal from '../ReserveModal/ReserveModal';
import styles from './PropertyReservationPanel.module.scss';

const BLOCKING = new Set(['PENDING', 'ACTIVE']);

export default function PropertyReservationPanel({ property, currentUser, defaultPercent }) {
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
      if (err?.response?.status !== 404) {
        setError('No se pudieron cargar las reservas.');
      }
    } finally {
      setLoading(false);
    }
  }, [canManage, property?.id]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!canReserve || !property?.id) return;
    let cancelled = false;
    reservationApi.getMyForProperty(property.id)
      .then((res) => {
        if (cancelled) return;
        setMyReservation(res.data?.data ?? null);
      })
      .catch(() => { if (!cancelled) setMyReservation(null); });
    return () => { cancelled = true; };
  }, [canReserve, property?.id]);

  if (property?.status !== 'PUBLISHED') {
    return null;
  }

  const pending = reservations.find((r) => BLOCKING.has(r.status));
  const hasBlocking = Boolean(pending);

  const handleConfirm = async (id) => {
    await reservationApi.confirm(id);
    refresh();
  };
  const handleReject = async (id) => {
    const reason = window.prompt('Motivo de cancelación:') ?? '';
    await reservationApi.cancel(id, { reason });
    refresh();
  };

  return (
    <Card className={styles.panel}>
      <Card.Body>
        <h5>Reserva online</h5>

        {canReserve && myReservation && (
          <Alert variant="success" className="mb-0">
            Ya reservaste esta propiedad por <strong>{formatCurrency(myReservation.amount)}</strong>.
            Estado actual: <Badge bg={statusVariant(myReservation.status)}>{statusLabel(myReservation.status)}</Badge>
          </Alert>
        )}
        {canReserve && !myReservation && !hasBlocking && (
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Reservar propiedad
          </Button>
        )}
        {canReserve && !myReservation && hasBlocking && (
          <Alert variant="info" className="mb-0">
            Esta propiedad tiene una reserva activa.
          </Alert>
        )}

        {canManage && loading && <Spinner animation="border" size="sm" />}
        {canManage && error && <Alert variant="danger">{error}</Alert>}
        {canManage && pending && (
          <div className={styles.pendingRow}>
            <div>
              <strong>{pending.buyerName}</strong> ({pending.buyerEmail})
              <Badge bg={statusVariant(pending.status)} className="ms-2">{statusLabel(pending.status)}</Badge>
              <div className="text-muted">Monto: {pending.amount}</div>
            </div>
            <div className="d-flex gap-2">
              {pending.status === 'PENDING' && (
                <Button size="sm" variant="success" onClick={() => handleConfirm(pending.id)}>
                  Confirmar
                </Button>
              )}
              <Button size="sm" variant="outline-danger" onClick={() => handleReject(pending.id)}>
                Rechazar
              </Button>
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
              title: 'Reserva enviada',
              text: created?.amount != null
                ? `Tu reserva por ${formatCurrency(created.amount)} quedó en estado ${created.status}.`
                : 'Tu reserva fue registrada y está pendiente de confirmación.',
              timer: 2000,
              showConfirmButton: false,
            });
            refresh();
          }}
        />
      </Card.Body>
    </Card>
  );
}
