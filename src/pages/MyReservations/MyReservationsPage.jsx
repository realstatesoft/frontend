import { useEffect, useState, useCallback } from 'react';
import { Container, Card, Spinner, Alert, Button, Badge, Table } from 'react-bootstrap';
import reservationApi from '../../services/reservations/reservationApi';
import styles from './MyReservationsPage.module.scss';

const statusVariant = (status) => ({
  PENDING: 'warning',
  ACTIVE: 'success',
  CANCELLED: 'secondary',
  EXPIRED: 'dark',
  CONVERTED_TO_CONTRACT: 'info',
}[status] ?? 'secondary');

export default function MyReservationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reservationApi.getMyReservations(0, 50);
      setItems(res.data?.data?.content ?? []);
    } catch (err) {
      setError('No se pudieron cargar tus reservas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id) => {
    const reason = window.prompt('Motivo:') ?? '';
    try {
      await reservationApi.cancel(id, { reason });
      load();
    } catch {
      setError('No se pudo cancelar la reserva.');
    }
  };

  return (
    <Container className={styles.container}>
      <h2>Mis reservas</h2>
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && items.length === 0 && (
        <Alert variant="info">Aún no tienes reservas.</Alert>
      )}
      {!loading && items.length > 0 && (
        <Card>
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Propiedad</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>{r.propertyTitle}</td>
                  <td>{r.amount}</td>
                  <td><Badge bg={statusVariant(r.status)}>{r.status}</Badge></td>
                  <td>
                    {(r.status === 'PENDING' || r.status === 'ACTIVE') && (
                      <Button size="sm" variant="outline-danger" onClick={() => handleCancel(r.id)}>
                        Cancelar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </Container>
  );
}