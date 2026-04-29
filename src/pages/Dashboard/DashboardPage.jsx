import { useTranslation } from 'react-i18next';
import { FiUsers, FiShoppingBag, FiMapPin, FiDollarSign } from 'react-icons/fi';
import StatCard from '../../components/common/StatCard/StatCard';
import QuickActions from '../../components/widgets/QuickActions/QuickActions';
import SalesPerformanceChart from '../../components/widgets/SalesPerformanceChart/SalesPerformanceChart';
import UpcomingAppointments from '../../components/widgets/UpcomingAppointments/UpcomingAppointments';
import useAgentStats from '../../hooks/useAgentStats';
import { formatCurrency } from '../../utils/formatters';
import { AGENT_TOUR_STEPS } from '../../data/tourSteps';
import { useAutoStartTour } from '../../hooks/useAutoStartTour';
import styles from './DashboardPage.module.scss';

export default function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const { data: response } = useAgentStats();
  const stats = response?.data || {};

  useAutoStartTour('agent', AGENT_TOUR_STEPS, 400);

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboard__header}>
        <div>
          <h1 className={styles.dashboard__title}>{t('agent.title')}</h1>
          <p className={styles.dashboard__subtitle}>{t('agent.subtitle')}</p>
        </div>
      </div>

      <div className={styles.dashboard__stats} data-tour="dashboard-stats">
        <StatCard
          label={t('agent.stats.activeClients')}
          value={stats.activeClients?.value ?? 0}
          trend={stats.activeClients?.trend}
          icon={<FiUsers />}
          colorAccent="accent"
        />
        <StatCard
          label={t('agent.stats.monthlySales')}
          value={stats.totalSales?.value ?? 0}
          trend={stats.totalSales?.trend}
          icon={<FiShoppingBag />}
          colorAccent="success"
        />
        <StatCard
          label={t('agent.stats.scheduledVisits')}
          value={stats.scheduledVisits?.value ?? 0}
          trend={stats.scheduledVisits?.trend}
          icon={<FiMapPin />}
          colorAccent="warning"
        />
        <StatCard
          label={t('agent.stats.commissions')}
          value={formatCurrency(stats.commissions?.value)}
          trend={stats.commissions?.trend}
          icon={<FiDollarSign />}
          colorAccent="info"
        />
      </div>

      <div data-tour="quick-actions">
        <QuickActions />
      </div>

      <div className={styles.dashboard__grid}>
        <SalesPerformanceChart />
        <UpcomingAppointments />
      </div>
    </div>
  );
}
