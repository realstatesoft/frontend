import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container, Card, Table, Badge, Spinner, Alert,
  Button, Dropdown, Pagination,
} from 'react-bootstrap';
import { FiCheckCircle, FiXCircle, FiCreditCard } from 'react-icons/fi';
import paymentApi from '../../services/payments/paymentApi';
import { formatDateTime } from '../../utils/formatters';
import styles from './AdminPaymentsPage.module.scss';

const PAGE_SIZE = 15;

const FILTER_OPTIONS = [
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Aprobados',  value: 'APPROVED' },
  { label: 'Rechazados', value: 'REJECTED' },
  { label: 'Todos',      value: '' },
];

const STATUS_VARIANT = {
  PENDING:   'warning',
  APPROVED:  'success',
  COMPLETED: 'primary',
  REJECTED:  'danger',
};

const STATUS_LABEL = {
  PENDING:   'Pendiente',
  APPROVED:  'Aprobado',
  COMPLETED: 'Completado',
  REJECTED:  'Rechazado',
};

const TYPE_COLORS = {
  PROPERTY_HIGHLIGHT: { bg: '#fef3c7', color: '#92400e' },
  RESERVATION:        { bg: '#dbeafe', color: '#1e40af' },
  CONTRACT:           { bg: '#f3e8ff', color: '#6b21a8' },
  SUBSCRIPTION:       { bg: '#dcfce7', color: '#166534' },
  OTHER:              { bg: '#f3f4f6', color: '#374151' },
};

const TYPE_LABEL = {
  PROPERTY_HIGHLIGHT: 'Destacado',
  RESERVATION:        'Reserva',
  CONTRACT:           'Contrato',
  SUBSCRIPTION:       'Suscripción',
  OTHER:              'Otro',
};

function formatGs(amount) {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency', currency: 'PYG', minimumFractionDigits: 0,
  }).format(amount ?? 0);
}

function buildPageItems(current, total) {
  const items = [];
  let last = -1;
  for (let i = 0; i < total; i++) {
    if (i === 0 || i === total - 1 || Math.abs(i - current) <= 2) {
      if (last !== -1 && i - last > 1) items.push('…');
      items.push(i);
      last = i;
    }
  }
  return items;
}

export default function AdminPaymentsPage() {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [filter, setFilter]         = useState('PENDING');
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actionId, setActionId]     = useState(null);
  const [stats, setStats]           = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const fetchRef = useRef(0);

  const loadStats = useCallback(async () => {
    try {
      const [pend, appr, rej, tot] = await Promise.all([
        paymentApi.getAllPayments(0, 1, null, 'PENDING'),
        paymentApi.getAllPayments(0, 1, null, 'APPROVED'),
        paymentApi.getAllPayments(0, 1, null, 'REJECTED'),
        paymentApi.getAllPayments(0, 1),
      ]);
      const count = (res) =>
        res?.data?.data?.page?.totalElements ?? 0;
      setStats({ pending: count(pend), approved: count(appr), rejected: count(rej), total: count(tot) });
    } catch { /* stats are non-critical */ }
  }, []);

  const fetchPayments = useCallback(async () => {
    const id = ++fetchRef.current;
    setLoading(true);
    setError(null);
    try {
      const res = await paymentApi.getAllPayments(page, PAGE_SIZE, null, filter || null);
      if (id !== fetchRef.current) return;
      const data = res?.data?.data ?? {};
      setItems(data.content ?? []);
      setTotalPages(data.page?.totalPages ?? 0);
      loadStats();
    } catch {
      if (id !== fetchRef.current) return;
      setError('No se pudieron cargar los pagos. Intente más tarde.');
    } finally {
      if (id === fetchRef.current) setLoading(false);
    }
  }, [page, filter, loadStats]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  function showSuccess(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  async function handleApprove(id) {
    setActionId(id);
    try {
      await paymentApi.approvePayment(id);
      showSuccess('Pago aprobado correctamente.');
      fetchPayments();
    } catch {
      setError('Error al aprobar el pago.');
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id) {
    setActionId(id);
    try {
      await paymentApi.rejectPayment(id);
      showSuccess('Pago rechazado.');
      fetchPayments();
    } catch {
      setError('Error al rechazar el pago.');
    } finally {
      setActionId(null);
    }
  }

  const activeLabel = FILTER_OPTIONS.find((o) => o.value === filter)?.label ?? 'Todos';

  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.header}>
          <h1 className="d-flex align-items-center justify-content-center gap-2">
            <FiCreditCard /> Gestión de Pagos
          </h1>
          <p className="text-muted mb-0">
            Revisá y aprobá los pagos simulados enviados por los usuarios
          </p>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={`${styles.statCard} ${styles.pending}`}>
            <div className={styles.statValue}>{stats.pending}</div>
            <div className={styles.statLabel}>Pendientes</div>
          </div>
          <div className={`${styles.statCard} ${styles.approved}`}>
            <div className={styles.statValue}>{stats.approved}</div>
            <div className={styles.statLabel}>Aprobados</div>
          </div>
          <div className={`${styles.statCard} ${styles.rejected}`}>
            <div className={styles.statValue}>{stats.rejected}</div>
            <div className={styles.statLabel}>Rechazados</div>
          </div>
          <div className={`${styles.statCard} ${styles.total}`}>
            <div className={styles.statValue}>{stats.total}</div>
            <div className={styles.statLabel}>Total</div>
          </div>
        </div>

        {error     && <Alert variant="danger"  dismissible onClose={() => setError(null)}     className="mb-3">{error}</Alert>}
        {successMsg && <Alert variant="success" dismissible onClose={() => setSuccessMsg(null)} className="mb-3">{successMsg}</Alert>}

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <Dropdown>
            <Dropdown.Toggle variant="light" className="fw-semibold border shadow-sm">
              {activeLabel}
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow-sm border-0">
              {FILTER_OPTIONS.map((o) => (
                <Dropdown.Item
                  key={o.value}
                  active={filter === o.value}
                  onClick={() => { setFilter(o.value); setPage(0); }}
                >
                  {o.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-3">Cargando pagos…</p>
          </div>
        ) : items.length === 0 ? (
          <Alert variant="info">
            {filter
              ? `No hay pagos con estado "${activeLabel}".`
              : 'No hay pagos registrados.'}
          </Alert>
        ) : (
          <Card className={styles.tableCard}>
            <Table responsive hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 100 }}>#</th>
                  <th>Concepto</th>
                  <th>Tipo</th>
                  <th>Monto</th>
                  <th>Usuario</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th style={{ width: 140 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => {
                  const typeStyle = TYPE_COLORS[p.type] ?? TYPE_COLORS.OTHER;
                  const isPending = p.status === 'PENDING';
                  const isBusy    = actionId === p.id;

                  return (
                    <tr key={p.id}>
                      <td className="text-muted" style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        {String(p.id).slice(0, 8)}…
                      </td>

                      <td className={styles.conceptCell}>
                        <div className={styles.conceptTitle}>{p.concept ?? '—'}</div>
                        {p.description && (
                          <div className={styles.conceptDesc} title={p.description}>
                            {p.description}
                          </div>
                        )}
                      </td>

                      <td>
                        <span
                          className={styles.typeBadge}
                          style={{ background: typeStyle.bg, color: typeStyle.color }}
                        >
                          {TYPE_LABEL[p.type] ?? p.type ?? '—'}
                        </span>
                      </td>

                      <td className={styles.amountCell}>{formatGs(p.amount)}</td>

                      <td style={{ fontSize: '0.85rem' }}>
                        {p.userName ?? p.userEmail ?? p.userId ?? '—'}
                      </td>

                      <td>
                        <Badge bg={STATUS_VARIANT[p.status] ?? 'secondary'}>
                          {STATUS_LABEL[p.status] ?? p.status}
                        </Badge>
                      </td>

                      <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        {formatDateTime(p.createdAt)}
                      </td>

                      <td>
                        <div className={styles.actions}>
                          {isPending ? (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                disabled={isBusy}
                                onClick={() => handleApprove(p.id)}
                                title="Aprobar pago"
                                className="d-flex align-items-center gap-1"
                              >
                                {isBusy
                                  ? <Spinner animation="border" size="sm" />
                                  : <><FiCheckCircle /> Aprobar</>}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                disabled={isBusy}
                                onClick={() => handleReject(p.id)}
                                title="Rechazar pago"
                                className="d-flex align-items-center gap-1"
                              >
                                <FiXCircle /> Rechazar
                              </Button>
                            </>
                          ) : (
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-3 justify-content-center">
            <Pagination.Prev disabled={page === 0} onClick={() => setPage((p) => p - 1)} />
            {buildPageItems(page, totalPages).map((item, idx) =>
              item === '…' ? (
                <Pagination.Ellipsis key={`e${idx}`} disabled />
              ) : (
                <Pagination.Item key={item} active={item === page} onClick={() => setPage(item)}>
                  {item + 1}
                </Pagination.Item>
              )
            )}
            <Pagination.Next disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} />
          </Pagination>
        )}
      </Container>
    </div>
  );
}
