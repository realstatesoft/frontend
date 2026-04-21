import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Spinner, Alert, Button, Badge, Table } from 'react-bootstrap';
import { ArrowLeft, Eye } from 'react-bootstrap-icons';
import CustomNavbar from '../../components/Landing/Navbar';
import reservationApi from '../../services/reservations/reservationApi';
import { formatCurrency } from '../../utils/formatters';
import styles from './MyReservationsPage.module.scss';

const statusVariant = (status) => ({
  PENDING: 'warning',
  ACTIVE: 'success',
  CANCELLED: 'secondary',
  EXPIRED: 'dark',
  CONVERTED_TO_CONTRACT: 'info',
}[status] ?? 'secondary');

export default function MyReservationsPage() {
  const navigate = useNavigate();
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

  const goToProperty = (propertyId) => {
    if (propertyId) navigate(`/properties/${propertyId}`);
  };

  return (
    <>
      <CustomNavbar />
      <Container className={styles.container}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <Button
            variant="light"
            className="d-flex align-items-center gap-1"
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <ArrowLeft size={18} /> Volver
          </Button>
          <h2 className="mb-0 ms-2">Mis reservas</h2>
        </div>
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
                  <tr
                    key={r.id}
                    onClick={() => goToProperty(r.propertyId)}
                    style={{ cursor: r.propertyId ? 'pointer' : 'default' }}
                  >
                    <td>{r.propertyTitle}</td>
                    <td>{formatCurrency(r.amount)}</td>
                    <td><Badge bg={statusVariant(r.status)}>{r.status}</Badge></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => goToProperty(r.propertyId)}
                          aria-label="Ver propiedad"
                        >
                          <Eye size={14} /> Ver
                        </Button>
                        {(r.status === 'PENDING' || r.status === 'ACTIVE') && (
                          <Button size="sm" variant="outline-danger" onClick={() => handleCancel(r.id)}>
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}
      </Container>
    </>
  );
}
