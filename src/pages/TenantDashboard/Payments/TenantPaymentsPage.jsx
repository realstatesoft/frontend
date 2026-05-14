import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FiCreditCard, FiCheckCircle, FiClock, FiDownload, FiAlertTriangle, FiFileText } from 'react-icons/fi';
import { useTenantPayments } from '../../../hooks/useTenantPayments';
import useFormatters from '../../../hooks/useFormatters';
import Button from '../../../components/common/Button/Button';
import Badge from '../../../components/common/Badge/Badge';
import { downloadPdf } from '../../../utils/downloadHelper';
import { buildPaymentUrl } from '../../../services/payments/buildPaymentUrl';
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

export default function TenantPaymentsPage() {
  const { t } = useTranslation('tenant');
  const navigate = useNavigate();
  const { data, isLoading, error, page, setPage } = useTenantPayments();
  const { formatCurrency, formatDate } = useFormatters();
  const [downloading, setDownloading] = useState(null); // 'receipt-id' or 'invoice-id'

  const handlePayInstallment = (inst) => {
    const url = buildPaymentUrl({
      amount: inst.balance ?? inst.totalAmount ?? 0,
      type: 'OTHER',
      description: `Cuota ${inst.installmentNumber} - ${inst.period}`,
      referenceId: String(inst.id),
    });
    navigate(url);
  };

  const handleDownloadReceipt = async (paymentId, installmentNumber, dateStr) => {
    setDownloading(`receipt-${paymentId}`);
    const filename = `receipt-${installmentNumber}-${dateStr}.pdf`;
    const res = await downloadPdf(`/rentals/payments/${paymentId}/receipt.pdf`, filename);
    
    if (!res.success) {
      if (res.status === 202) {
        Swal.fire({
          icon: 'info',
          title: 'En proceso',
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
    setDownloading(null);
  };

  const handleDownloadInvoice = async (installmentId, installmentNumber, dateStr) => {
    setDownloading(`invoice-${installmentId}`);
    const filename = `invoice-${installmentNumber}-${dateStr}.pdf`;
    const res = await downloadPdf(`/rentals/installments/${installmentId}/invoice.pdf`, filename);
    
    if (!res.success) {
      if (res.status === 202) {
        Swal.fire({
          icon: 'info',
          title: 'En proceso',
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
    setDownloading(null);
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

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Pagos</h1>
          <p className={styles.subtitle}>Gestiona tus pagos de renta</p>
        </div>
      </header>

      {/* Acciones principales (Mockups según screenshot) */}
      <div className={styles.actionCards}>
        <div className={styles.actionCard}>
          <div className={styles.actionCard__icon}><FiCreditCard /></div>
          <h3>Pagar Renta</h3>
          <p>Realiza tu pago mensual de forma segura</p>
          <Button className={styles.actionCard__btn} onClick={() => {
            const nextPending = data?.installments?.find(i => i.status !== 'PAID');
            if (nextPending) handlePayInstallment(nextPending);
            else Swal.fire({ icon: 'info', title: 'Todo al día', text: 'No tienes cuotas pendientes de pago.' });
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
        <h3 className={styles.sectionTitle}>Historial de Pagos</h3>

        <div className={styles.list}>
          {data?.installments?.map((inst) => (
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
                  <h4>{formatCurrency(inst.totalAmount)}</h4>
                  <div className={styles.badges}>
                    <Badge variant={STATUS_VARIANTS[inst.status]}>{STATUS_LABELS[inst.status] || inst.status}</Badge>
                    {inst.status !== 'PAID' && (
                      <Button size="sm" className={styles.payBtn} onClick={() => handlePayInstallment(inst)}>Pagar</Button>
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
                      <span className={styles.paymentAmt}>{formatCurrency(payment.amount)}</span>
                      
                      {payment.id && (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={downloading === `receipt-${payment.id}`}
                          onClick={() => handleDownloadReceipt(payment.id, inst.installmentNumber, formatDate(payment.date))}
                        >
                          <FiDownload /> {downloading === `receipt-${payment.id}` ? '...' : 'Recibo'}
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
                        onClick={() => handleDownloadInvoice(inst.id, inst.installmentNumber, formatDate(inst.dueDate))}
                      >
                        <FiFileText /> {downloading === `invoice-${inst.id}` ? 'Descargando...' : 'Descargar Factura'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {(!data?.installments || data.installments.length === 0) && (
            <div className={styles.empty}>
              <FiClock className={styles.emptyIcon} />
              <p>No tienes cuotas registradas en este contrato.</p>
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
