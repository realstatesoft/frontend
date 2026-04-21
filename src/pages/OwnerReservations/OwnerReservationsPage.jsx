import { useEffect, useState, useCallback } from 'react';
import { Container, Card, Spinner, Alert, Badge, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import reservationApi from '../../services/reservations/reservationApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import styles from './OwnerReservationsPage.module.scss';

const statusVariant = (status) => ({
  PENDING: 'warning',
  ACTIVE: 'success',
  CANCELLED: 'secondary',
  EXPIRED: 'dark',
  CONVERTED_TO_CONTRACT: 'info',
}[status] ?? 'secondary');

export default function OwnerReservationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reservationApi.getOwnerReservations(0, 50);
      setItems(res.data?.data?.content ?? []);
    } catch {
      setError('No se pudieron cargar las reservas recibidas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Container className={styles.container}>
      <h2>Reservas recibidas</h2>
      <p className="text-muted">Reservas enviadas por usuarios sobre tus propiedades publicadas.</p>
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && items.length === 0 && (
        <Alert variant="info">No hay reservas sobre tus propiedades.</Alert>
      )}
      {!loading && items.length > 0 && (
        <Card>
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Propiedad</th>
                <th>Comprador</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td><Link to={`/properties/${r.propertyId}`}>{r.propertyTitle}</Link></td>
                  <td>{r.buyerName}</td>
                  <td>{formatCurrency(r.amount)}</td>
                  <td><Badge bg={statusVariant(r.status)}>{r.status}</Badge></td>
                  <td>{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </Container>
  );
}