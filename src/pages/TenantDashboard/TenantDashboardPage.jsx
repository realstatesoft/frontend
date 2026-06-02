import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  FiCalendar, FiCheckCircle, FiTool, FiHome,
  FiFileText, FiEye, FiCreditCard, FiAlertTriangle, FiArrowRight
} from 'react-icons/fi';
import { useTenantDashboard } from '../../hooks/useTenantDashboard';
import useFormatters from '../../hooks/useFormatters';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button/Button';
import { buildPaymentUrl } from '../../services/payments/buildPaymentUrl';
import styles from './TenantDashboardPage.module.scss';

export default function TenantDashboardPage() {
  const { t } = useTranslation('tenant');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, error } = useTenantDashboard();
  const { formatCurrency, formatDate } = useFormatters();

  if (isLoading) return <div className={styles.loading} role="status">{t('loading', 'Cargando...')}</div>;


  if (error || !data) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.inactive}>
          <FiAlertTriangle className={styles.inactive__icon} />
          <h2>{t('tenantDashboard.errorTitle', 'Error al cargar el dashboard')}</h2>
          <p>{t('tenantDashboard.errorMessage', 'Hubo un problema al obtener la información de tu arriendo.')}</p>

        </div>
      </div>
    );
  }

  const {
    status,
    activeLeases,
    nextInstallment,
    totalPaidLastYear,
    openMaintenanceTickets,
    recentInstallments,
    recentMaintenanceTickets
  } = data;

  if (status === 'INACTIVE') {
    return (
      <div className={styles.dashboard}>
        <div className={styles.inactive}>
          <FiHome className={styles.inactive__icon} />
          <h2>{t('inactive.title', 'Sin arriendo activo')}</h2>
          <p>{t('inactive.message', 'No tienes un arriendo activo en este momento. Explora nuestras propiedades disponibles para encontrar tu próximo hogar.')}</p>
          <Button onClick={() => navigate('/properties')}>
            {t('tenantDashboard.exploreProperties', 'Explorar propiedades')} <FiArrowRight />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>
          {t('tenantDashboard.welcome', { name: user?.name?.split(' ')[0] || t('tenantDashboard.defaultName', 'Inquilino') })}
        </h1>
        <p className={styles.subtitle}>{t('tenantDashboard.subtitle', 'Resumen de tu arrendamiento')}</p>

      </header>

      {/* Summary Grid */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCard__header}>
            {t('tenantDashboard.nextPayment', 'Próximo Pago')} <FiCalendar className={styles.summaryCard__icon + ' ' + styles['summaryCard__icon--blue']} />

          </div>
          <div className={styles.summaryCard__value}>
            {nextInstallment ? formatDate(nextInstallment.dueDate) : '--/--/----'}
          </div>
          <div className={styles.summaryCard__sub}>
            {nextInstallment ? formatCurrency(nextInstallment.balance, nextInstallment.currency) : '$ 0'}
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryCard__header}>
            {t('tenantDashboard.totalPaid', 'Total Pagado')} <FiCheckCircle className={styles.summaryCard__icon + ' ' + styles['summaryCard__icon--green']} />

          </div>
          <div className={styles.summaryCard__value}>
            {formatCurrency(totalPaidLastYear, activeLeases?.[0]?.currency)}
          </div>
          <div className={styles.summaryCard__sub}>{t('tenantDashboard.totalPaidPeriod', 'En los últimos 12 meses')}</div>

        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryCard__header}>
            {t('tenantDashboard.daysRemaining', 'Días Restantes')} <FiCalendar className={styles.summaryCard__icon + ' ' + styles['summaryCard__icon--blue']} />

          </div>
          <div className={styles.summaryCard__value}>
            {activeLeases?.length
              ? Math.min(...activeLeases.map(l => l.daysRemaining || 0))
              : '0'}
          </div>
          <div className={styles.summaryCard__sub}>{t('tenantDashboard.contractDays', 'Días de contrato')}</div>

        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryCard__header}>
            {t('tenantDashboard.openTickets', 'Tickets Abiertos')} <FiTool className={styles.summaryCard__icon + ' ' + styles['summaryCard__icon--orange']} />

          </div>
          <div className={styles.summaryCard__value}>{openMaintenanceTickets}</div>
          <div className={styles.summaryCard__sub}>{t('tenantDashboard.maintenanceRequests', 'Solicitudes de mantenimiento')}</div>

        </div>
      </div>

      {/* Mis Propiedades */}
      {activeLeases?.map((lease) => (
        <div key={lease.leaseId} className={styles.propertyCard}>
          <img
            src={lease.propertyImage || lease.property?.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600"}
            alt={lease.propertyTitle}
            className={styles.propertyCard__image}
          />

          <div className={styles.propertyCard__content}>
            <div className={styles.propertyCard__top}>
              <div className={styles.propertyCard__main}>
                <h2 className={styles.propertyCard__title}>{lease.propertyTitle}</h2>
                <p className={styles.propertyCard__desc}>{lease.propertyAddress}</p>
              </div>
              <div className={styles.propertyCard__landlord}>
                <label>{t('tenant.property.owner', 'Propietario')}</label>
                <p>{lease.landlordName}</p>
                <span>{lease.landlordEmail}</span>
              </div>
              <span className={styles.propertyCard__badge}>{t('tenant.property.status.active', 'Activo')}</span>
            </div>

            <div className={styles.propertyCard__grid}>
              <div className={styles.propertyCard__infoBox}>
                <label>{t('tenant.property.startDate', 'Inicio de contrato')}</label>
                <span>{formatDate(lease.startDate)}</span>
              </div>
              <div className={styles.propertyCard__infoBox}>
                <label>{t('tenant.property.endDate', 'Fin de contrato')}</label>
                <span>{formatDate(lease.endDate)}</span>
              </div>
            </div>

            <div className={styles.propertyCard__top}>
              <div className={styles.propertyCard__actions}>
                <Button variant="secondary" onClick={() => navigate(`/tenant/lease/${lease.leaseId}`)}>
                  <FiFileText /> {t('tenant.property.viewLease', 'Ver Contrato')}
                </Button>
                <Button variant="secondary" onClick={() => lease.propertyId && navigate(`/properties/${lease.propertyId}`)} disabled={!lease.propertyId}>
                  <FiHome /> {t('tenant.property.details', 'Detalles')}
                </Button>
              </div>
              <div className={styles.propertyCard__rent}>
                <label>{t('tenant.property.monthlyRent', 'Renta mensual')}</label>
                <span>{formatCurrency(lease.monthlyRent, lease.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Two Column Section */}
      <div className={styles.detailsGrid}>
        {/* Proximos Pagos */}
        <div className={styles.section}>
          <div className={styles.section__header}>
            <h3>{t('upcomingPayments', 'Próximos Pagos')}</h3>
            <Button variant="secondary" size="sm" onClick={() => navigate('/tenant/payments')}>
              {t('viewHistory', 'Ver historial')}
            </Button>
          </div>

          
          {recentInstallments?.map((inst) => (
            <div key={inst.installmentId} className={styles.listItem}>
              <div className={`${styles.listItem__icon} ${inst.status === 'PAID' ? styles['listItem__icon--paid'] : styles['listItem__icon--payment']}`}>
                <FiCreditCard />
              </div>
              <div className={styles.listItem__info}>
                <h4>{t('installmentLabel', { number: inst.installmentNumber })}</h4>
                <p>{t('dueLabel', 'Vence:')} {formatDate(inst.dueDate)}</p>
              </div>

              <div className={styles.listItem__side}>
                <div className={styles.listItem__amount}>{formatCurrency(inst.totalAmount, inst.currency)}</div>
                {inst.status === 'PAID' ? (
                  <span className={`${styles.statusBadge} ${styles['statusBadge--paid']}`}>
                    <FiCheckCircle /> {t('paid', 'Pagado')}
                  </span>
                ) : (
                  <Button size="sm" onClick={() => {
                    const url = buildPaymentUrl({
                      amount: inst.balance ?? inst.totalAmount ?? 0,
                      type: 'OTHER',
                      description: `Cuota ${inst.installmentNumber}`,
                      referenceId: String(inst.installmentId),
                    });
                    navigate(url);
                  }}>
                    {t('payNow', 'Pagar Ahora')}
                  </Button>
                )}

              </div>
            </div>
          ))}
        </div>

        {/* Solicitudes de Mantenimiento */}
        <div className={styles.section}>
          <div className={styles.section__header}>
            <h3>{t('maintenance.title', 'Solicitudes de Mantenimiento')}</h3>
            <Button size="sm" onClick={() => navigate('/tenant/maintenance')}>
              {t('maintenance.newRequest', 'Nueva Solicitud')}
            </Button>
          </div>

          
          {recentMaintenanceTickets?.map((ticket) => (
            <div key={ticket.id} className={styles.listItem}>
              <div className={`${styles.listItem__icon} ${styles['listItem__icon--maintenance']}`}>
                <FiTool />
              </div>
              <div className={styles.listItem__info}>
                <h4>{ticket.title}</h4>
                <p>{ticket.category} • {formatDate(ticket.createdAt)}</p>
              </div>
              <div className={styles.listItem__side}>
                <span className={`${styles.statusBadge} ${ticket.status === 'IN_PROGRESS' ? styles['statusBadge--progress'] : styles['statusBadge--assigned']}`}>
                  {ticket.status === 'IN_PROGRESS' ? t('maintenance.inProgress', 'En progreso') : t('maintenance.assigned', 'Asignado')}
                </span>

              </div>
            </div>
          ))}
          
          {!recentMaintenanceTickets?.length && (
            <div className={styles.empty}>{t('maintenance.empty', 'No hay solicitudes recientes.')}</div>
          )}

        </div>
      </div>

      {/* Recordatorio Alert */}
      {nextInstallment && nextInstallment.status !== 'PAID' && (
        <div className={styles.alert}>
          <FiAlertTriangle className={styles.alert__icon} />
          <div className={styles.alert__content}>
            <h4>{t('tenant.paymentReminder.title', 'Recordatorio de Pago')}</h4>
            <p>
              {t('tenant.paymentReminder.message', { dueDate: formatDate(nextInstallment.dueDate) })}
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
