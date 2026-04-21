import { useState, useEffect, useCallback } from 'react';
import { Button, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import reservationApi from '../../../services/reservations/reservationApi';
import ReserveModal from '../ReserveModal/ReserveModal';
import styles from './PropertyReservationPanel.module.scss';

const BLOCKING = new Set(['PENDING', 'ACTIVE']);

export default function PropertyReservationPanel({ property, currentUser, defaultPercent }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const isOwner = currentUser?.id === property?.owner?.id;
  const canManage = isOwner || currentUser?.role === 'ADMIN';
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

        {canReserve && !hasBlocking && (
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Reservar propiedad
          </Button>
        )}
        {canReserve && hasBlocking && (
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
              <Badge bg="warning" className="ms-2">{pending.status}</Badge>
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
          onCreated={() => refresh()}
        />
      </Card.Body>
    </Card>
  );
}