import { useEffect, useState, useCallback } from 'react';
import { Container, Card, Spinner, Alert, Badge, Table, Form, Pagination, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import reservationApi from '../../services/reservations/reservationApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { statusVariant, statusLabel } from '../../utils/reservationStatus';
import { ArrowLeft } from 'react-bootstrap-icons';
import CustomNavbar from '../../components/Landing/Navbar';
import Footer from '../../components/Landing/Footer';
import styles from './OwnerReservationsPage.module.scss';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDING',               label: 'Pendiente' },
  { value: 'ACTIVE',                label: 'Activa' },
  { value: 'CANCELLED',             label: 'Cancelada' },
  { value: 'EXPIRED',               label: 'Expirada' },
  { value: 'CONVERTED_TO_CONTRACT', label: 'Convertida a contrato' },
];

const PAGE_SIZE = 10;

export default function OwnerReservationsPage() {
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
      const res = await reservationApi.getOwnerReservations(currentPage, PAGE_SIZE, currentStatus || null);
      const data = res.data?.data ?? {};
      setItems(data.content ?? []);
      setTotalPages(data.totalPages ?? 0);
    } catch {
      setError('No se pudieron cargar las reservas recibidas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page, status); }, [load, page, status]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(0);
  };

  return (
    <>
      <CustomNavbar />
      <Container className={`${styles.container} py-5`}>
        <Button variant="link" className="text-decoration-none text-muted p-0 mb-3 d-flex align-items-center" onClick={() => navigate(-1)}>
          <ArrowLeft className="me-2" /> Volver atrás
        </Button>
      
        <h2>Reservas recibidas</h2>
        <p className="text-muted">Reservas enviadas por usuarios sobre tus propiedades publicadas.</p>

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
        <Alert variant="info">No hay reservas sobre tus propiedades.</Alert>
      )}
      {!loading && items.length > 0 && (
        <>
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
                    <td><Badge bg={statusVariant(r.status)}>{statusLabel(r.status)}</Badge></td>
                    <td>{formatDate(r.createdAt)}</td>
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
    <Footer />
    </>
  );
}
