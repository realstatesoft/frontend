import { useEffect, useState, useCallback } from 'react';
import { Container, Spinner, Alert, Form, Pagination } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircleFill, XCircle, FileEarmarkText } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import reservationApi from '../../services/reservations/reservationApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { statusLabel } from '../../utils/reservationStatus';
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

  const handleStatusChange = (e) => { setStatus(e.target.value); setPage(0); };

  const handleConfirm = async (id) => {
    try {
      await reservationApi.confirm(id);
    } catch {
      setError('No se pudo confirmar la reserva.');
      return;
    }
    load(page, status);
  };

  const handleReject = async (id, isActive) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: isActive ? 'Motivo de cancelación' : 'Motivo de rechazo',
      input: 'textarea',
      inputPlaceholder: 'Escribí el motivo...',
      showCancelButton: true,
      confirmButtonText: isActive ? 'Cancelar reserva' : 'Rechazar',
      cancelButtonText: 'Volver',
      confirmButtonColor: '#dc3545',
    });
    if (!isConfirmed) return;
    try {
      await reservationApi.cancel(id, { reason: reason ?? '' });
      load(page, status);
    } catch {
      setError('No se pudo procesar la acción.');
    }
  };

  const handleCreateContract = (reservation) => {
    const params = new URLSearchParams();
    params.set('propertyId', reservation.propertyId);
    params.set('buyerId', reservation.buyerId);
    params.set('buyerName', reservation.buyerName);
    params.set('buyerEmail', reservation.buyerEmail);
    if (reservation.amount) params.set('amount', reservation.amount);
    navigate(`/owner/contratos/nuevo?${params.toString()}`);
  };

  return (
    <>
      <CustomNavbar />
      <Container className={`${styles.container} py-5`}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Volver atrás
        </button>
        <h2 className={styles.title}>Reservas recibidas</h2>
        <p className={styles.subtitle}>Reservas enviadas por usuarios sobre tus propiedades publicadas.</p>

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
          <Alert variant="info">No hay reservas sobre tus propiedades.</Alert>
        )}

        {!loading && items.length > 0 && (
          <div className={styles.list}>
            {items.map((r) => (
              <div key={r.id} className={styles.card}>
                <div className={styles.colorBar} style={{ background: STATUS_COLORS[r.status] ?? '#6c757d' }} />
                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
                    <div>
                      <div className={styles.propLabel}>Propiedad</div>
                      <Link to={`/properties/${r.propertyId}`} className={styles.propTitle}>{r.propertyTitle}</Link>
                    </div>
                    <span className={styles.statusBadge} style={STATUS_BADGE[r.status] ?? STATUS_BADGE.CANCELLED}>
                      {statusLabel(r.status)}
                    </span>
                  </div>
                  <div className={styles.cardMeta}>
                    <div className={styles.metaBlock}>
                      <span className={styles.metaLabel}>Interesado</span>
                      <span className={styles.metaValue}>{r.buyerName}</span>
                      <span className={styles.metaSub}>{r.buyerEmail}</span>
                    </div>
                    <div className={styles.metaBlock}>
                      <span className={styles.metaLabel}>Monto ofrecido</span>
                      <span className={styles.metaAmount}>{formatCurrency(r.amount)}</span>
                    </div>
                    <div className={styles.metaBlock}>
                      <span className={styles.metaLabel}>Recibida el</span>
                      <span className={styles.metaValue}>{formatDate(r.createdAt)}</span>
                    </div>
                  </div>
                  {(r.status === 'PENDING' || r.status === 'ACTIVE') && (
                    <div className={styles.actions}>
                      {r.status === 'PENDING' && (
                        <button className={styles.btnConfirm} onClick={() => handleConfirm(r.id)}>
                          <CheckCircleFill size={14} /> Confirmar
                        </button>
                      )}
                      {r.status === 'ACTIVE' && (
                        <button
                          className={styles.btnContract}
                          onClick={() => handleCreateContract(r)}
                        >
                          <FileEarmarkText size={14} /> Crear contrato
                        </button>
                      )}
                      <button
                        className={styles.btnReject}
                        onClick={() => handleReject(r.id, r.status === 'ACTIVE')}
                      >
                        <XCircle size={14} /> {r.status === 'PENDING' ? 'Rechazar' : 'Cancelar reserva'}
                      </button>
                    </div>
                  )}
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
      <Footer />
    </>
  );
}
