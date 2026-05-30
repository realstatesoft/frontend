import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { FiCreditCard, FiCheckCircle, FiClock, FiDownload, FiAlertTriangle, FiFileText } from 'react-icons/fi';
import { useTenantPayments } from '../../../hooks/useTenantPayments';
import useFormatters from '../../../hooks/useFormatters';
import Button from '../../../components/common/Button/Button';
import Badge from '../../../components/common/Badge/Badge';
import { downloadPdf } from '../../../utils/downloadHelper';
import rentService from '../../../services/rentService';
import Swal from 'sweetalert2';
import styles from './TenantPaymentsPage.module.scss';

const STATUS_VARIANTS = {
  PENDING: 'warning',
  PAID: 'success',
  OVERDUE: 'danger',
  PARTIAL: 'accent',
};

const STATUS_LABELS = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  OVERDUE: 'Atrasado',
  PARTIAL: 'Pago Parcial',
};

const buildPdfFilename = (prefix, installmentNumber, date) => {
  const cuota = String(installmentNumber ?? 'cuota').replace(/[^a-zA-Z0-9_-]+/g, '-');
  const fecha = String(date ?? new Date().toISOString().slice(0, 10)).slice(0, 10);
  return `${prefix}-${cuota}-${fecha}.pdf`;
};

export default function TenantPaymentsPage() {
  const { t } = useTranslation('tenant');
  const navigate = useNavigate();
  const { data, isLoading, error, page, setPage, refresh } = useTenantPayments();
  const { formatCurrency, formatDate } = useFormatters();
  const [downloading, setDownloading] = useState(null); // 'receipt-id' or 'invoice-id'
  const [payingId, setPayingId] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const handlePayInstallment = async (inst) => {
    if (payingId) return;
    const confirm = await Swal.fire({
      title: 'Confirmar pago',
      text: `¿Deseas pagar ${formatCurrency(inst.balance ?? inst.totalAmount ?? 0, inst.currency)} por la cuota ${inst.installmentNumber}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, pagar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirm.isConfirmed) return;

    setPayingId(inst.id);
    try {
      await rentService.registerManualPayment(
        inst.id,
        { amount: inst.balance ?? inst.totalAmount ?? 0, method: 'CARD' },
        `tenant-${inst.id}-${Date.now()}`
      );
      Swal.fire({
        icon: 'success',
        title: 'Pago exitoso',
        text: 'La cuota fue pagada correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });
      refresh();
    } catch (err) {
      const msg = err.response?.data?.message ?? 'No se pudo procesar el pago.';
      Swal.fire({ icon: 'error', title: 'Error', text: msg });
    } finally {
      setPayingId(null);
    }
  };

  const handleDownloadReceipt = async (payment, installmentNumber, dateStr) => {
    const paymentId = payment.id;
    setDownloading(`receipt-${paymentId}`);
    try {
      const filename = buildPdfFilename('recibo', installmentNumber, dateStr);
      const res = await downloadPdf(payment.receiptUrl || `/tenant/payments/${paymentId}/receipt.pdf`, filename);

      if (!res.success) {
        if (res.status === 202) {
          Swal.fire({
            icon: 'info',
            title: 'PDF en generación',
            text: res.message,
            timer: 3000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo descargar el recibo.',
          });
        }
      }
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadInvoice = async (inst) => {
    const installmentId = inst.id;
    setDownloading(`invoice-${installmentId}`);
    try {
      const filename = buildPdfFilename('factura', inst.installmentNumber, inst.dueDate);
      const res = await downloadPdf(inst.invoiceUrl || `/tenant/payments/installments/${installmentId}/invoice.pdf`, filename);

      if (!res.success) {
        if (res.status === 202) {
          Swal.fire({
            icon: 'info',
            title: 'PDF en generación',
            text: res.message,
            timer: 3000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo descargar la factura.',
          });
        }
      }
    } finally {
      setDownloading(null);
    }
  };

  if (isLoading && !data) return <div className={styles.loading}>Cargando...</div>;

  if (error) {
    return (
      <div className={styles.error}>
        <FiAlertTriangle />
        <p>Error al cargar el historial de pagos.</p>
      </div>
    );
  }

  // Frontend year filtering since backend doesn't filter by year yet.
  const availableYears = data?.installments 
    ? [...new Set(data.installments.map(inst => new Date(inst.dueDate).getFullYear().toString()))].sort().reverse()
    : [new Date().getFullYear().toString()];
  
  if (!availableYears.includes(selectedYear) && availableYears.length > 0) {
    // If the selected year is not in the list, keep the selection but allow the user to see empty results,
    // or we could default to the first available. For now, just keep selectedYear.
  }

  const filteredInstallments = selectedYear === 'ALL' 
    ? data?.installments 
    : data?.installments?.filter(inst => new Date(inst.dueDate).getFullYear().toString() === selectedYear);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Pagos</h1>
          <p className={styles.subtitle}>Gestiona tus pagos de renta</p>
        </div>
        
        {/* Totales anuales en el header */}
        <div className={styles.headerStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Pagado (12 meses)</span>
            <span className={styles.statValue}>{formatCurrency(data?.totalPaidYear || 0, data?.installments?.[0]?.currency)}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Cuotas al Día</span>
            <span className={`${styles.statValue} ${styles['statValue--success']}`}>{data?.onTime || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Cuotas Morosas</span>
            <span className={`${styles.statValue} ${styles['statValue--danger']}`}>{data?.late || 0}</span>
          </div>
        </div>
      </header>

      {/* Acciones principales (Mockups según screenshot) */}
      <div className={styles.actionCards}>
        <div className={styles.actionCard}>
          <div className={styles.actionCard__icon}><FiCreditCard /></div>
          <h3>Pagar Renta</h3>
          <p>Realiza tu pago mensual de forma segura</p>
          <Button className={styles.actionCard__btn} disabled={!!payingId} onClick={() => {
            if (payingId) return;
            const pendingInstallments = data?.installments?.filter(i => i.status !== 'PAID');
            if (pendingInstallments && pendingInstallments.length > 0) {
              handlePayInstallment(pendingInstallments[0]);
            } else {
              Swal.fire({ icon: 'info', title: 'Todo al día', text: 'No tienes cuotas pendientes de pago.' });
            }
          }}>Pagar Ahora</Button>
        </div>
        <div className={styles.actionCard}>
          <div className={`${styles.actionCard__icon} ${styles['actionCard__icon--green']}`}><FiCheckCircle /></div>
          <h3>Auto-Pay</h3>
          <p>Configura pagos automáticos mensuales</p>
          <Button variant="secondary" className={styles.actionCard__btn}>Configurar</Button>
        </div>
        <div className={styles.actionCard}>
          <div className={styles.actionCard__icon}><FiDownload /></div>
          <h3>Recibos</h3>
          <p>Descarga tus comprobantes de pago</p>
          <Button variant="secondary" className={styles.actionCard__btn}>Ver Recibos</Button>
        </div>
      </div>

      <section className={styles.historySection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Historial de Pagos</h3>
          <select 
            className={styles.yearFilter}
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="ALL">Todos los años</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className={styles.list}>
          {filteredInstallments?.map((inst) => (
            <div key={inst.id} className={styles.installmentCard}>
              <div className={styles.installmentCard__main}>
                <div className={`${styles.iconWrapper} ${inst.status === 'PAID' ? styles['iconWrapper--paid'] : styles['iconWrapper--pending']}`}>
                  {inst.status === 'PAID' ? <FiCheckCircle /> : <FiClock />}
                </div>
                <div className={styles.installmentInfo}>
                  <h4>{inst.period}</h4>
                  <p>Vencimiento: {formatDate(inst.dueDate)}</p>
                </div>
                <div className={styles.installmentAmount}>
                  <h4>{formatCurrency(inst.totalAmount, inst.currency)}</h4>
                  <div className={styles.badges}>
                    <Badge variant={STATUS_VARIANTS[inst.status]}>{STATUS_LABELS[inst.status] || inst.status}</Badge>
                    {inst.status !== 'PAID' && (
                      <Button size="sm" className={styles.payBtn} disabled={!!payingId} onClick={() => handlePayInstallment(inst)}>
                        {payingId === inst.id ? 'Procesando...' : 'Pagar'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Detalle de pagos (Recibos y Facturas) */}
              {(inst.payments?.length > 0 || inst.status === 'PAID') && (
                <div className={styles.paymentsDetail}>
                  {inst.payments?.map((payment, idx) => (
                    <div key={idx} className={styles.paymentRow}>
                      <span className={styles.paymentDate}>{formatDate(payment.date)}</span>
                      <span className={styles.paymentMethod}>{payment.method}</span>
                      <span className={styles.paymentAmt}>{formatCurrency(payment.amount, payment.currency)}</span>
                      
                      {payment.id && (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={downloading === `receipt-${payment.id}`}
                          onClick={() => handleDownloadReceipt(payment, inst.installmentNumber, payment.date)}
                        >
                          {downloading === `receipt-${payment.id}` ? <Spinner animation="border" size="sm" /> : <FiDownload />}
                          Recibo
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* Factura disponible si está pagado */}
                  {inst.status === 'PAID' && (
                    <div className={styles.invoiceRow}>
                      <span>Factura del período</span>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={downloading === `invoice-${inst.id}`}
                        onClick={() => handleDownloadInvoice(inst)}
                      >
                        {downloading === `invoice-${inst.id}` ? <Spinner animation="border" size="sm" /> : <FiFileText />}
                        Descargar Factura
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {(!filteredInstallments || filteredInstallments.length === 0) && (
            <div className={styles.empty}>
              <FiClock className={styles.emptyIcon} />
              <p>No tienes cuotas registradas en este período.</p>
            </div>
          )}
        </div>

        {/* Paginación simple si aplica */}
        {data?.totalPages > 1 && (
          <div className={styles.pagination}>
            <Button 
              variant="secondary" 
              disabled={page === 0} 
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <span>Página {page + 1} de {data.totalPages}</span>
            <Button 
              variant="secondary" 
              disabled={page >= data.totalPages - 1} 
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
