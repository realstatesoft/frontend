import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Spinner, Alert, Form, Pagination } from 'react-bootstrap';
import { ArrowLeft, Eye, XCircle } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import CustomNavbar from '../../components/Landing/Navbar';
import reservationApi from '../../services/reservations/reservationApi';
import useFormatters from '../../hooks/useFormatters';
import { statusLabel } from '../../utils/reservationStatus';
import styles from './MyReservationsPage.module.scss';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDING',               label: 'Pendiente' },
  { value: 'ACTIVE',                label: 'Activa' },
  { value: 'CANCELLED',             label: 'Cancelada' },
  { value: 'EXPIRED',               label: 'Expirada' },
  { value: 'CONVERTED_TO_CONTRACT', label: 'Convertida a contrato' },
];

const STATUS_COLORS = {
  PENDING: '#ffc107', ACTIVE: '#198754',
  CANCELLED: '#6c757d', EXPIRED: '#6c757d',
  CONVERTED_TO_CONTRACT: '#0d6efd',
};

const STATUS_BADGE = {
  PENDING:               { background: '#fff3cd', color: '#856404', border: '1px solid #ffc107' },
  ACTIVE:                { background: '#d1e7dd', color: '#0a3622', border: '1px solid #a3cfbb' },
  CANCELLED:             { background: '#e9ecef', color: '#495057', border: '1px solid #ced4da' },
  EXPIRED:               { background: '#e9ecef', color: '#495057', border: '1px solid #ced4da' },
  CONVERTED_TO_CONTRACT: { background: '#cfe2ff', color: '#084298', border: '1px solid #9ec5fe' },
};

const PAGE_SIZE = 10;

export default function MyReservationsPage() {
  const navigate = useNavigate();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [status, setStatus]   = useState('');
  const [page, setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { formatCurrency, formatDate } = useFormatters();

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

  const handleStatusChange = (e) => { setStatus(e.target.value); setPage(0); };

  const handleCancel = async (id) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: '¿Cancelar esta reserva?',
      input: 'textarea',
      inputPlaceholder: 'Motivo (opcional)...',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
      confirmButtonColor: '#dc3545',
    });
    if (!isConfirmed) return;
    try {
      await reservationApi.cancel(id, { reason: reason ?? '' });
      load(page, status);
    } catch {
      setError('No se pudo cancelar la reserva.');
    }
  };

  return (
    <>
      <CustomNavbar />
      <Container className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Volver">
            <ArrowLeft size={18} /> Volver
          </button>
          <h2 className={styles.title}>Mis reservas</h2>
        </div>

        <div className={styles.filterRow}>
          <Form.Select
            size="sm"
            value={status}
            onChange={handleStatusChange}
            aria-label="Filtrar por estado"
            style={{ maxWidth: 260 }}
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
          <div className={styles.list}>
            {items.map((r) => (
              <div key={r.id} className={styles.card}>
                <div className={styles.colorBar} style={{ background: STATUS_COLORS[r.status] ?? '#6c757d' }} />
                <div className={styles.cardBody}>
                  <div className={styles.cardMain}>
                    <div className={styles.thumbnail} />
                    <div className={styles.info}>
                      <div className={styles.propertyTitle}>
                        {r.propertyId
                          ? <Link to={`/properties/${r.propertyId}`}>{r.propertyTitle}</Link>
                          : r.propertyTitle}
                      </div>
                      <div className={styles.meta}>
                        Enviada el {formatDate(r.createdAt)}
                        {r.expiresAt ? ` · Expira ${formatDate(r.expiresAt)}` : ''}
                      </div>
                      <div className={styles.statusRow}>
                        <span className={styles.statusBadge} style={STATUS_BADGE[r.status] ?? STATUS_BADGE.CANCELLED}>
                          {statusLabel(r.status)}
                        </span>
                        <span className={styles.amount}>{formatCurrency(r.amount)}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.btnSecondary}
                      onClick={() => r.propertyId && navigate(`/properties/${r.propertyId}`)}
                      aria-label="Ver propiedad"
                    >
                      <Eye size={14} /> Ver propiedad
                    </button>
                    {(r.status === 'PENDING' || r.status === 'ACTIVE') && (
                      <button className={styles.btnOutlineDanger} onClick={() => handleCancel(r.id)}>
                        <XCircle size={14} /> Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
      </Container>
    </>
  );
}
