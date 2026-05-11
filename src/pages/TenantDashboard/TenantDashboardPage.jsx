import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  FiCalendar, FiCheckCircle, FiTool, FiHome, 
  FiFileText, FiEye, FiCreditCard, FiAlertTriangle, FiArrowRight
} from 'react-icons/fi';
import { useTenantDashboard } from '../../hooks/useTenantDashboard';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import styles from './TenantDashboardPage.module.scss';

export default function TenantDashboardPage() {
  const { t } = useTranslation('tenant');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, error } = useTenantDashboard();

  if (isLoading) return <div className={styles.loading} role="status">Cargando...</div>;

  if (error || !data) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.inactive}>
          <FiAlertTriangle className={styles.inactive__icon} />
          <h2>Error al cargar el dashboard</h2>
          <p>Hubo un problema al obtener la información de tu arriendo.</p>
        </div>
      </div>
    );
  }

  const {
    status,
    activeLease,
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
          <button className={styles.btn} onClick={() => navigate('/properties')}>
            Explorar propiedades <FiArrowRight />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Bienvenido, {user?.name?.split(' ')[0] || 'Inquilino'}</h1>
        <p className={styles.subtitle}>Resumen de tu arrendamiento</p>
      </header>

      {/* Summary Grid */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCard__header}>
            Próximo Pago <FiCalendar className={styles.summaryCard__icon + ' ' + styles['summaryCard__icon--blue']} />
          </div>
          <div className={styles.summaryCard__value}>
            {nextInstallment ? formatDate(nextInstallment.dueDate) : '--/--/----'}
          </div>
          <div className={styles.summaryCard__sub}>
            {nextInstallment ? formatCurrency(nextInstallment.balance) : '$ 0'}
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryCard__header}>
            Total Pagado <FiCheckCircle className={styles.summaryCard__icon + ' ' + styles['summaryCard__icon--green']} />
          </div>
          <div className={styles.summaryCard__value}>
            {formatCurrency(totalPaidLastYear)}
          </div>
          <div className={styles.summaryCard__sub}>En los últimos 12 meses</div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryCard__header}>
            Días Restantes <FiCalendar className={styles.summaryCard__icon + ' ' + styles['summaryCard__icon--blue']} />
          </div>
          <div className={styles.summaryCard__value}>{activeLease?.daysRemaining || '0'}</div>
          <div className={styles.summaryCard__sub}>Días de contrato</div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryCard__header}>
            Tickets Abiertos <FiTool className={styles.summaryCard__icon + ' ' + styles['summaryCard__icon--orange']} />
          </div>
          <div className={styles.summaryCard__value}>{openMaintenanceTickets}</div>
          <div className={styles.summaryCard__sub}>Solicitudes de mantenimiento</div>
        </div>
      </div>

      {/* Mi Propiedad Hero Card */}
      {activeLease && (
        <div className={styles.propertyCard}>
          <img 
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600" 
            alt={activeLease.propertyTitle} 
            className={styles.propertyCard__image}
          />
          <div className={styles.propertyCard__content}>
            <div className={styles.propertyCard__top}>
              <div className={styles.propertyCard__main}>
                <h2 className={styles.propertyCard__title}>{activeLease.propertyTitle}</h2>
                <p className={styles.propertyCard__desc}>{activeLease.propertyAddress}</p>
              </div>
              <div className={styles.propertyCard__landlord}>
                <label>Propietario</label>
                <p>{activeLease.landlordName}</p>
                <span>{activeLease.landlordEmail}</span>
              </div>
              <span className={styles.propertyCard__badge}>Activo</span>
            </div>

            <div className={styles.propertyCard__grid}>
              <div className={styles.propertyCard__infoBox}>
                <label>Inicio de contrato</label>
                <span>{formatDate(activeLease.startDate)}</span>
              </div>
              <div className={styles.propertyCard__infoBox}>
                <label>Fin de contrato</label>
                <span>{formatDate(activeLease.endDate)}</span>
              </div>
            </div>

            <div className={styles.propertyCard__top}>
              <div className={styles.propertyCard__actions}>
                <button className={styles.btn} onClick={() => navigate('/tenant/lease')}>
                  <FiFileText /> Ver Contrato
                </button>
                <button className={styles.btn} onClick={() => navigate(`/properties/${activeLease.propertyId}`)}>
                  <FiHome /> Detalles
                </button>
              </div>
              <div className={styles.propertyCard__rent}>
                <label>Renta mensual</label>
                <span>{formatCurrency(activeLease.monthlyRent)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Section */}
      <div className={styles.detailsGrid}>
        {/* Proximos Pagos */}
        <div className={styles.section}>
          <div className={styles.section__header}>
            <h3>Próximos Pagos</h3>
            <button className={styles.section__link} onClick={() => navigate('/tenant/payments')}>
              Ver historial
            </button>
          </div>
          
          {recentInstallments?.map((inst) => (
            <div key={inst.installmentId} className={styles.listItem}>
              <div className={`${styles.listItem__icon} ${inst.status === 'PAID' ? styles['listItem__icon--paid'] : styles['listItem__icon--payment']}`}>
                <FiCreditCard />
              </div>
              <div className={styles.listItem__info}>
                <h4>Cuota #{inst.installmentNumber}</h4>
                <p>Vence: {formatDate(inst.dueDate)}</p>
              </div>
              <div className={styles.listItem__side}>
                <div className={styles.listItem__amount}>{formatCurrency(inst.totalAmount)}</div>
                {inst.status === 'PAID' ? (
                  <span className={`${styles.statusBadge} ${styles['statusBadge--paid']}`}>
                    <FiCheckCircle /> Pagado
                  </span>
                ) : (
                  <button className={styles.payBtn} onClick={() => navigate('/tenant/payments')}>
                    Pagar Ahora
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Solicitudes de Mantenimiento */}
        <div className={styles.section}>
          <div className={styles.section__header}>
            <h3>Solicitudes de Mantenimiento</h3>
            <button className={styles.payBtn} onClick={() => navigate('/tenant/maintenance/new')}>
              Nueva Solicitud
            </button>
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
                  {ticket.status === 'IN_PROGRESS' ? 'En progreso' : 'Asignado'}
                </span>
              </div>
            </div>
          ))}
          
          {!recentMaintenanceTickets?.length && (
            <div className={styles.empty}>No hay solicitudes recientes.</div>
          )}
        </div>
      </div>

      {/* Recordatorio Alert */}
      {nextInstallment && nextInstallment.status !== 'PAID' && (
        <div className={styles.alert}>
          <FiAlertTriangle className={styles.alert__icon} />
          <div className={styles.alert__content}>
            <h4>Recordatorio de Pago</h4>
            <p>
              Tu próximo pago vence el {formatDate(nextInstallment.dueDate)}. 
              Recuerda realizar el pago antes de la fecha límite para evitar cargos adicionales.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
