import { useState } from 'react';
import { 
  FiHome, FiEye, FiMessageCircle, FiTrendingUp, 
  FiDollarSign, FiAlertTriangle, FiArrowRight, FiFileText, FiFeather 
} from 'react-icons/fi';
import StatCard from '../../components/common/StatCard/StatCard';
import OwnerQuickActions from '../../components/widgets/OwnerQuickActions/OwnerQuickActions';
import useOwnerOverview from '../../hooks/useOwnerOverview';
import { OWNER_TOUR_STEPS } from '../../data/tourSteps';
import { useAutoStartTour } from '../../hooks/useAutoStartTour';
import styles from './OwnerDashboardPage.module.scss';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import ContractSignModal from '../Contracts/ContractSignModal';
import Swal from 'sweetalert2';

export default function OwnerDashboardPage() {
  const { data: response, isLoading, refetch } = useOwnerOverview();
  const navigate = useNavigate();
  const [signContract, setSignContract] = useState(null);

  const { stats = {}, recentProperties = [], urgentContracts = [], pendingVisits = [] } = response?.data || {};

  const hasUrgentContracts = urgentContracts.length > 0;
  const hasPendingVisits = pendingVisits.length > 0;

  if (isLoading) {
    return <div className={styles.empty}>Cargando dashboard...</div>;
  }

  useAutoStartTour('owner', OWNER_TOUR_STEPS, 400);

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboard__header}>
        <div>
          <h1 className={styles.dashboard__title}>Mi Panel</h1>
          <p className={styles.dashboard__subtitle}>Resumen de tus propiedades y transacciones</p>
        </div>
      </div>

      {hasUrgentContracts && (
        <div className={styles.dashboard__alert}>
          <div className={styles.dashboard__alert_icon}>
            <FiAlertTriangle />
          </div>
          <div className={styles.dashboard__alert_content}>
            <h3 className={styles.dashboard__alert_title}>Acción requerida</h3>
            <p className={styles.dashboard__alert_text}>
              Tienes {urgentContracts.length} contrato(s) pendiente(s) de tu firma digital.
            </p>
          </div>
          <button 
            className={styles.dashboard__alert_action}
            onClick={() => setSignContract(urgentContracts[0])}
          >
            Firmar ahora
          </button>
        </div>
      )}

      {!hasUrgentContracts && hasPendingVisits && (
        <div className={`${styles.dashboard__alert} ${styles['dashboard__alert--info']}`}>
          <div className={styles.dashboard__alert_icon}>
            <FiEye />
          </div>
          <div className={styles.dashboard__alert_content}>
            <h3 className={styles.dashboard__alert_title}>Nuevas visitas</h3>
            <p className={styles.dashboard__alert_text}>
              Tienes {pendingVisits.length} solicitud(es) de visita esperando respuesta.
            </p>
          </div>
          <button 
            className={styles.dashboard__alert_action}
            onClick={() => navigate('/owner/visitas')}
          >
            Gestionar visitas
          </button>
        </div>
      )}

      <div className={styles.dashboard__stats} data-tour="dashboard-stats">
        <StatCard
          label="Mis Propiedades"
          value={stats.myProperties?.value ?? 0}
          icon={<FiHome />}
          colorAccent="accent"
        />
        <StatCard
          label="Visitas Totales"
          value={stats.totalVisits?.value ?? 0}
          icon={<FiEye />}
          colorAccent="success"
        />
        <StatCard
          label="Consultas"
          value={stats.inquiries?.value ?? 0}
          icon={<FiMessageCircle />}
          colorAccent="warning"
        />
        <StatCard
          label="Ingresos Realizados"
          value={formatCurrency(stats.totalEarnings?.value ?? 0)}
          icon={<FiDollarSign />}
          colorAccent="info"
          hint="Datos basados en contratos cerrados"
        />
      </div>

      <div data-tour="quick-actions">
        <OwnerQuickActions />
      </div>


      <div className={styles.dashboard__grid}>
        {/* Columna Izquierda: Mis Propiedades Recientes */}
        <div className={styles.section}>
          <div className={styles.section__header}>
            <h2 className={styles.section__title}>Propiedades recientes</h2>
            <span className={styles.section__link} onClick={() => navigate('/owner/propiedades')}>
              Ver todas <FiArrowRight />
            </span>
          </div>

          {recentProperties.length === 0 ? (
            <div className={styles.empty}>Aún no tienes propiedades publicadas.</div>
          ) : (
            <div className={styles.list}>
              {recentProperties.map(prop => (
                <div key={prop.id} className={styles.list_item}>
                  {prop.mainImageUrl ? (
                    <img src={prop.mainImageUrl} alt={prop.title} className={styles.list_item_img} />
                  ) : (
                    <div className={`${styles.list_item_img} ${styles.list_item_img}--placeholder`} />
                  )}
                  <div className={styles.list_item_info}>
                    <span className={styles.list_item_title}>{prop.title}</span>
                    <div className={styles.list_item_meta}>
                      {prop.propertyType} • {formatCurrency(prop.price)}
                    </div>
                  </div>
                  <button 
                    className={styles.list_item_action}
                    onClick={() => navigate(`/properties/${prop.id}`)}
                  >
                    Ver ficha
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna Central: Contratos Pendientes */}
        <div className={styles.section}>
          <div className={styles.section__header}>
            <h2 className={styles.section__title}>Firmas pendientes</h2>
            <FiFileText color="var(--color-text-muted)" />
          </div>

          {urgentContracts.length === 0 ? (
            <div className={styles.empty}>No tienes contratos pendientes de firma.</div>
          ) : (
            <div className={styles.list}>
              {urgentContracts.map(contract => (
                <div key={contract.id} className={styles.list_item}>
                  <div className={styles.list_item_info}>
                    <span className={styles.list_item_title}>Contrato #{contract.id}</span>
                    <div className={styles.list_item_meta}>
                      {contract.propertyTitle || 'Sin título'} • {formatDate(contract.createdAt)}
                    </div>
                  </div>
                  <div className={styles.list_item_actions}>
                    <button 
                      className={styles.list_item_action}
                      onClick={() => navigate(`/contratos/${contract.id}`)}
                    >
                      Ver
                    </button>
                    <button 
                      className={`${styles.list_item_action} ${styles['list_item_action--primary']}`}
                      onClick={() => setSignContract(contract)}
                    >
                      <FiFeather /> Firmar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Nuevas Visitas */}
        <div className={styles.section}>
          <div className={styles.section__header}>
            <h2 className={styles.section__title}>Visitas pendientes</h2>
            <span className={styles.section__link} onClick={() => navigate('/owner/visitas')}>
              Ver todas <FiArrowRight />
            </span>
          </div>

          {pendingVisits.length === 0 ? (
            <div className={styles.empty}>No tienes solicitudes de visita pendientes.</div>
          ) : (
            <div className={styles.list}>
              {pendingVisits.map(visit => (
                <div key={visit.id} className={styles.list_item}>
                  <div className={styles.list_item_info}>
                    <span className={styles.list_item_title}>{visit.propertyTitle}</span>
                    <div className={styles.list_item_meta}>
                      {visit.visitorName} • {formatDate(visit.proposedAt)}
                    </div>
                  </div>
                  <button 
                    className={`${styles.list_item_action} ${styles['list_item_action--primary']}`}
                    onClick={() => navigate('/owner/visitas')}
                  >
                    Gestionar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Firma */}
      {signContract && (
        <ContractSignModal
          contract={signContract}
          onClose={() => setSignContract(null)}
          onSuccess={() => {
            setSignContract(null);
            refetch();
            Swal.fire({
              title: '¡Éxito!',
              text: 'Has firmado el contrato digitalmente.',
              icon: 'success',
              confirmButtonColor: 'var(--color-accent)'
            });
          }}
        />
      )}
    </div>
  );
}
