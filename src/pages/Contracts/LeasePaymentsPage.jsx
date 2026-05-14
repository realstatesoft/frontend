import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Spinner, Form } from 'react-bootstrap';
import { FiArrowLeft, FiPlus, FiDownload, FiAlertTriangle } from 'react-icons/fi';
import { useLeasePayments } from '../../hooks/useLeasePayments';
import useFormatters from '../../hooks/useFormatters';
import Button from '../../components/common/Button/Button';
import Badge from '../../components/common/Badge/Badge';
import ManualPaymentModal from '../../components/payments/ManualPaymentModal';
import { downloadPdf } from '../../utils/downloadHelper';
import Swal from 'sweetalert2';
import styles from './LeasePaymentsPage.module.scss';

const STATUS_VARIANTS = {
  PENDING: 'warning',
  PAID: 'success',
  OVERDUE: 'danger',
  PARTIAL: 'accent',
};

const STATUS_LABELS = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  OVERDUE: 'Mora',
  PARTIAL: 'Parcial',
};

export default function LeasePaymentsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { installments, isLoading, error, registerPayment } = useLeasePayments(id);
  const { formatCurrency, formatDate } = useFormatters();
  
  const [statusFilter, setStatusFilter] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [downloading, setDownloading] = useState(null);

  const filteredInstallments = useMemo(() => {
    if (!statusFilter) return installments;
    return installments.filter(inst => inst.status === statusFilter);
  }, [installments, statusFilter]);

  const totals = useMemo(() => {
    return installments.reduce((acc, inst) => {
      acc.total += inst.totalAmount || 0;
      acc.paid += inst.paidAmount || 0;
      acc.balance += inst.balance || 0;
      if (inst.status === 'OVERDUE') {
        acc.overdue += inst.balance || inst.totalAmount || 0;
      }
      return acc;
    }, { total: 0, paid: 0, balance: 0, overdue: 0 });
  }, [installments]);

  const handleDownloadReceipt = async (paymentId) => {
    setDownloading(paymentId);
    const res = await downloadPdf(`/rentals/payments/${paymentId}/receipt.pdf`, `receipt-${paymentId}.pdf`);
    
    if (!res.success) {
      if (res.status === 202) {
        Swal.fire({ icon: 'info', title: 'Generando...', text: res.message, timer: 3000, showConfirmButton: false });
      } else {
        Swal.fire('Error', 'No se pudo descargar el recibo.', 'error');
      }
    }
    setDownloading(null);
  };

  if (isLoading) return <div className={styles.loading}><Spinner animation="border" /></div>;

  if (error) return (
    <div className={styles.error}>
      <FiAlertTriangle />
      <p>Error al cargar las cuotas.</p>
      <Button onClick={() => navigate(-1)}>Volver</Button>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button variant="light" onClick={() => navigate(-1)} className={styles.backBtn}>
          <FiArrowLeft /> Volver al contrato
        </Button>
        <div className={styles.titleRow}>
          <h2>Cuotas y Pagos</h2>
          <Button onClick={() => setShowPaymentModal(true)}>
            <FiPlus /> Registrar Pago
          </Button>
        </div>
      </div>

      <div className={styles.totalsCards}>
        <div className={styles.totalCard}>
          <span>Total Cobrado</span>
          <h4>{formatCurrency(totals.paid)}</h4>
        </div>
        <div className={styles.totalCard}>
          <span>Total Pendiente</span>
          <h4>{formatCurrency(totals.balance)}</h4>
        </div>
        <div className={`${styles.totalCard} ${styles['totalCard--danger']}`}>
          <span>Mora Acumulada</span>
          <h4>{formatCurrency(totals.overdue)}</h4>
        </div>
      </div>

      <div className={styles.filters}>
        <Form.Select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.statusSelect}
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </Form.Select>
      </div>

      <div className={styles.tableContainer}>
        <Table responsive hover className="mb-0">
          <thead>
            <tr>
              <th>Período</th>
              <th>Vencimiento</th>
              <th>Monto Total</th>
              <th>Saldo</th>
              <th>Estado</th>
              <th>Pagos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstallments.map(inst => (
              <tr 
                key={inst.id} 
                className={`${styles.row} ${inst.status === 'OVERDUE' ? styles['row--overdue'] : ''}`}
              >
                <td>{inst.period || `Cuota ${inst.installmentNumber}`}</td>
                <td>{formatDate(inst.dueDate)}</td>
                <td>{formatCurrency(inst.totalAmount)}</td>
                <td>{formatCurrency(inst.balance)}</td>
                <td>
                  <Badge variant={STATUS_VARIANTS[inst.status]}>
                    {STATUS_LABELS[inst.status] || inst.status}
                  </Badge>
                </td>
                <td>
                  {inst.payments?.length > 0 ? (
                    <div className={styles.paymentsList}>
                      {inst.payments.map((p, idx) => (
                        <div key={idx} className={styles.paymentLine}>
                          {formatDate(p.date)} - {formatCurrency(p.amount)}
                        </div>
                      ))}
                    </div>
                  ) : '-'}
                </td>
                <td>
                  <div className={styles.actions}>
                    {['PENDING', 'OVERDUE', 'PARTIAL'].includes(inst.status) && (
                      <Button size="sm" onClick={() => setShowPaymentModal(true)}>
                        Pagar
                      </Button>
                    )}
                    {inst.status === 'PAID' && inst.payments?.length > 0 && inst.payments[0].id && (
                      <Button 
                        variant="secondary" 
                        size="sm"
                        disabled={downloading === inst.payments[0].id}
                        onClick={() => handleDownloadReceipt(inst.payments[0].id)}
                      >
                        <FiDownload /> Recibo
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredInstallments.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  No se encontraron cuotas.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <ManualPaymentModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        installments={installments}
        onSave={registerPayment}
      />
    </div>
  );
}
