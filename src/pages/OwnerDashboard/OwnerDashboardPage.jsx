import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import useFormatters from '../../hooks/useFormatters';
import { useNavigate } from 'react-router-dom';
import ContractSignModal from '../Contracts/ContractSignModal';
import Swal from 'sweetalert2';
import usePropertyPriceDisplay from '../../hooks/usePropertyPriceDisplay';

export default function OwnerDashboardPage() {
  const { t } = useTranslation('owner');
  const { data: response, isLoading, refetch } = useOwnerOverview();
  const navigate = useNavigate();
  const [signContract, setSignContract] = useState(null);
  const { formatCurrency, formatDate } = useFormatters();
  const { formatPrice } = usePropertyPriceDisplay(0);

  const { stats = {}, recentProperties = [], urgentContracts = [], pendingVisits = [] } = response || {};

  const hasUrgentContracts = urgentContracts.length > 0;
  const hasPendingVisits = pendingVisits.length > 0;

  useAutoStartTour('owner', OWNER_TOUR_STEPS, 400);

  if (isLoading) {
    return <div className={styles.empty}>{t('loading')}</div>;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboard__header}>
        <div>
          <h1 className={styles.dashboard__title}>{t('title')}</h1>
          <p className={styles.dashboard__subtitle}>{t('subtitle')}</p>
        </div>
      </div>

      {hasUrgentContracts && (
        <div className={styles.dashboard__alert}>
          <div className={styles.dashboard__alert_icon}>
            <FiAlertTriangle />
          </div>
          <div className={styles.dashboard__alert_content}>
            <h3 className={styles.dashboard__alert_title}>{t('actionRequired')}</h3>
            <p className={styles.dashboard__alert_text}>
              {t('urgentContracts', { count: urgentContracts.length })}
            </p>
          </div>
          <button 
            className={styles.dashboard__alert_action}
            onClick={() => setSignContract(urgentContracts[0])}
          >
            {t('signNow')}
          </button>
        </div>
      )}

      {!hasUrgentContracts && hasPendingVisits && (
        <div className={`${styles.dashboard__alert} ${styles['dashboard__alert--info']}`}>
          <div className={styles.dashboard__alert_icon}>
            <FiEye />
          </div>
          <div className={styles.dashboard__alert_content}>
            <h3 className={styles.dashboard__alert_title}>{t('newVisits')}</h3>
            <p className={styles.dashboard__alert_text}>
              {t('pendingVisits', { count: pendingVisits.length })}
            </p>
          </div>
          <button 
            className={styles.dashboard__alert_action}
            onClick={() => navigate('/owner/visitas')}
          >
            {t('manageVisits')}
          </button>
        </div>
      )}

      <div className={styles.dashboard__stats} data-tour="dashboard-stats">
        <StatCard
          label={t('dashboard.recentProperties')}
          value={stats.myProperties?.value ?? 0}
          icon={<FiHome />}
          colorAccent="accent"
        />
        <StatCard
          label={t('visits.stats.total')}
          value={stats.totalVisits?.value ?? 0}
          icon={<FiEye />}
          colorAccent="success"
        />
        <StatCard
          label={t('messages.title')}
          value={stats.inquiries?.value ?? 0}
          icon={<FiMessageCircle />}
          colorAccent="warning"
        />
        <StatCard
          label={t('dashboard.earnings', { defaultValue: 'Ingresos Realizados' })}
          value={formatCurrency(stats.totalEarnings?.value ?? 0)}
          icon={<FiDollarSign />}
          colorAccent="info"
          hint={t('contractHint')}
        />
      </div>

      <div data-tour="quick-actions">
        <OwnerQuickActions />
      </div>


      <div className={styles.dashboard__grid}>
        {/* Columna Izquierda: Mis Propiedades Recientes */}
        <div className={styles.section}>
          <div className={styles.section__header}>
            <h2 className={styles.section__title}>{t('dashboard.recentProperties')}</h2>
            <button type="button" className={styles.section__link} onClick={() => navigate('/owner/propiedades')}>
              {t('dashboard.viewAll')} <FiArrowRight />
            </button>
          </div>

          {recentProperties.length === 0 ? (
            <div className={styles.empty}>{t('dashboard.emptyRecentProperties')}</div>
          ) : (
            <div className={styles.list}>
              {recentProperties.map(prop => (
                <div key={prop.id} className={styles.list_item}>
                  {prop.mainImageUrl ? (
                    <img src={prop.mainImageUrl} alt={prop.title} className={styles.list_item_img} />
                  ) : (
                    <div className={`${styles.list_item_img} ${styles['list_item_img--placeholder']}`} />
                  )}
                  <div className={styles.list_item_info}>
                    <span className={styles.list_item_title}>{prop.title}</span>
                    <div className={styles.list_item_meta}>
                      {prop.propertyType} • {formatPrice(prop.price).label || '—'}
                    </div>
                  </div>
                  <button 
                    className={styles.list_item_action}
                    onClick={() => navigate(`/properties/${prop.id}`)}
                  >
                    {t('dashboard.viewProperty')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna Central: Contratos Pendientes */}
        <div className={styles.section}>
          <div className={styles.section__header}>
            <h2 className={styles.section__title}>{t('dashboard.pendingSignatures')}</h2>
            <FiFileText color="var(--color-text-muted)" />
          </div>

          {urgentContracts.length === 0 ? (
            <div className={styles.empty}>{t('dashboard.emptyContracts')}</div>
          ) : (
            <div className={styles.list}>
              {urgentContracts.map(contract => (
                <div key={contract.id} className={styles.list_item}>
                  <div className={styles.list_item_info}>
                    <span className={styles.list_item_title}>{t('dashboard.contractPrefix')}{contract.id}</span>
                    <div className={styles.list_item_meta}>
                      {contract.propertyTitle || 'Sin título'} • {formatDate(contract.createdAt)}
                    </div>
                  </div>
                  <div className={styles.list_item_actions}>
                    <button 
                      className={styles.list_item_action}
                      onClick={() => navigate(`/contratos/${contract.id}`)}
                    >
                      {t('view', { ns: 'common' })}
                    </button>
                    <button 
                      className={`${styles.list_item_action} ${styles['list_item_action--primary']}`}
                      onClick={() => setSignContract(contract)}
                    >
                      <FiFeather /> {t('dashboard.sign')}
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
            <h2 className={styles.section__title}>{t('dashboard.pendingVisitsTitle')}</h2>
            <button type="button" className={styles.section__link} onClick={() => navigate('/owner/visitas')}>
              {t('dashboard.viewAll')} <FiArrowRight />
            </button>
          </div>

          {pendingVisits.length === 0 ? (
            <div className={styles.empty}>{t('dashboard.emptyVisits')}</div>
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
                    {t('dashboard.manage')}
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
              title: t('successTitle'),
              text: t('successText'),
              icon: 'success',
              confirmButtonColor: 'var(--color-accent)'
            });
          }}
        />
      )}
    </div>
  );
}
