import { useNavigate } from 'react-router-dom';
import {
  Container, Card, Spinner, Alert, Badge, Table,
  Form, Pagination, Button,
} from 'react-bootstrap';
import { ArrowLeft, CreditCard2Front } from 'react-bootstrap-icons';
import CustomNavbar from '../../components/Landing/Navbar';
import Footer from '../../components/Landing/Footer';
import useMyPayments from '../../hooks/useMyPayments';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { buildPageItems, PAGE_ELLIPSIS } from '../../utils/pagination';
import styles from './MyPaymentsPage.module.scss';

const STATUS_OPTIONS = [
  { value: '',          label: 'Todos los estados' },
  { value: 'PENDING',   label: 'Pendiente' },
  { value: 'APPROVED',  label: 'Aprobado' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'REJECTED',  label: 'Rechazado' },
  { value: 'FAILED',    label: 'Fallido' },
];

const STATUS_VARIANT = {
  PENDING:   'warning',
  APPROVED:  'success',
  COMPLETED: 'primary',
  REJECTED:  'danger',
  FAILED:    'danger',
};

const STATUS_LABEL = {
  PENDING:   'Pendiente',
  APPROVED:  'Aprobado',
  COMPLETED: 'Completado',
  REJECTED:  'Rechazado',
  FAILED:    'Fallido',
};

export default function MyPaymentsPage() {
  const navigate = useNavigate();
  const {
    items, loading, error,
    statusFilter, handleStatusChange,
    page, setPage, totalPages,
  } = useMyPayments();

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
          <h2 className="mb-0 ms-2 d-flex align-items-center gap-2">
            <CreditCard2Front size={24} />
            Mis pagos
          </h2>
        </div>

        <div className="mb-3" style={{ maxWidth: 260 }}>
          <Form.Select
            size="sm"
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
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
          <Alert variant="info">
            {statusFilter
              ? `No hay pagos con estado "${STATUS_LABEL[statusFilter] ?? statusFilter}".`
              : 'Aún no tienes pagos registrados.'}
          </Alert>
        )}

        {!loading && items.length > 0 && (
          <>
            <Card>
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Concepto</th>
                    <th>Monto</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id}>
                      <td className="text-muted" style={{ fontSize: '0.85rem' }}>
                        {String(p.id).slice(0, 8)}…
                      </td>
                      <td>
                        <div className="fw-semibold">{p.concept ?? '—'}</div>
                        {p.description && (
                          <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                            {p.description}
                          </div>
                        )}
                      </td>
                      <td className="fw-semibold">{formatCurrency(p.amount)}</td>
                      <td>
                        <Badge bg={STATUS_VARIANT[p.status] ?? 'secondary'}>
                          {STATUS_LABEL[p.status] ?? p.status}
                        </Badge>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {formatDateTime(p.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>

            {totalPages > 1 && (
              <Pagination className="mt-3 justify-content-center">
                <Pagination.Prev
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                />
                {buildPageItems(page, totalPages).map((item, idx) =>
                  item === PAGE_ELLIPSIS ? (
                    <Pagination.Ellipsis key={`ellipsis-${idx}`} disabled />
                  ) : (
                    <Pagination.Item
                      key={item}
                      active={item === page}
                      onClick={() => setPage(item)}
                    >
                      {item + 1}
                    </Pagination.Item>
                  )
                )}
                <Pagination.Next
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                />
              </Pagination>
            )}
          </>
        )}
      </Container>
      <Footer />
    </>
  );
}
