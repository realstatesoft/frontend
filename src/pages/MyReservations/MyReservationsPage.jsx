import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Spinner, Alert, Button, Badge, Table, Form, Pagination } from 'react-bootstrap';
import { ArrowLeft, Eye } from 'react-bootstrap-icons';
import CustomNavbar from '../../components/Landing/Navbar';
import reservationApi from '../../services/reservations/reservationApi';
import { formatCurrency } from '../../utils/formatters';
import { statusVariant, statusLabel } from '../../utils/reservationStatus';
import styles from './MyReservationsPage.module.scss';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDING',               label: 'Pendiente' },
  { value: 'ACTIVE',                label: 'Activa' },
  { value: 'CANCELLED',             label: 'Cancelada' },
  { value: 'EXPIRED',               label: 'Expirada' },
  { value: 'CONVERTED_TO_CONTRACT', label: 'Convertida a contrato' },
];

const PAGE_SIZE = 10;

export default function MyReservationsPage() {
  const navigate = useNavigate();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [status, setStatus]   = useState('');
  const [page, setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = useCallback(async (currentPage, currentStatus) => {
    setLoading(true);
    setError(null);
    try {
      const res = await reservationApi.getMyReservations(currentPage, PAGE_SIZE, currentStatus || null);
      const data = res.data?.data ?? {};
      setItems(data.content ?? []);
      setTotalPages(data.totalPages ?? 0);
    } catch {
      setError('No se pudieron cargar tus reservas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page, status); }, [load, page, status]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(0);
  };

  const handleCancel = async (id) => {
    const reasonResult = window.prompt('Motivo:');
    if (reasonResult === null) return;
    try {
      await reservationApi.cancel(id, { reason: reasonResult });
      load(page, status);
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

        <div className="mb-3" style={{ maxWidth: 260 }}>
          <Form.Select
            size="sm"
            value={status}
            onChange={handleStatusChange}
            aria-label="Filtrar por estado"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Form.Select>
        </div>

        {loading && <Spinner animation="border" />}
        {error && <Alert variant="danger">{error}</Alert>}
        {!loading && !error && items.length === 0 && (
          <Alert variant="info">Aún no tienes reservas.</Alert>
        )}
        {!loading && items.length > 0 && (
          <>
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
                      <td>
                        {r.propertyId
                          ? <Link to={`/properties/${r.propertyId}`}>{r.propertyTitle}</Link>
                          : r.propertyTitle}
                      </td>
                      <td>{formatCurrency(r.amount)}</td>
                      <td>
                        <Badge bg={statusVariant(r.status)}>{statusLabel(r.status)}</Badge>
                      </td>
                      <td>
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

            {totalPages > 1 && (
              <Pagination className="mt-3 justify-content-center">
                <Pagination.Prev disabled={page === 0} onClick={() => setPage((p) => p - 1)} />
                {Array.from({ length: totalPages }, (_, i) => (
                  <Pagination.Item key={i} active={i === page} onClick={() => setPage(i)}>
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} />
              </Pagination>
            )}
          </>
        )}
      </Container>
    </>
  );
}
