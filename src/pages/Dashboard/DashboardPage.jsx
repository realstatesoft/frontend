import { FiUsers, FiShoppingBag, FiMapPin, FiDollarSign } from 'react-icons/fi';
import StatCard from '../../components/common/StatCard/StatCard';
import QuickActions from '../../components/widgets/QuickActions/QuickActions';
import SalesPerformanceChart from '../../components/widgets/SalesPerformanceChart/SalesPerformanceChart';
import UpcomingAppointments from '../../components/widgets/UpcomingAppointments/UpcomingAppointments';
import useAgentStats from '../../hooks/useAgentStats';
import { formatCurrency } from '../../utils/formatters';
import styles from './DashboardPage.module.scss';

export default function DashboardPage() {
  const { data: response } = useAgentStats();
  const stats = response?.data || {};

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboard__header}>
        <div>
          <h1 className={styles.dashboard__title}>Dashboard</h1>
          <p className={styles.dashboard__subtitle}>Resumen de tu actividad</p>
        </div>
      </div>

      <div className={styles.dashboard__stats}>
        <StatCard
          label="Clientes Activos"
          value={stats.activeClients?.value ?? 0}
          trend={stats.activeClients?.trend}
          icon={<FiUsers />}
          colorAccent="accent"
        />
        <StatCard
          label="Ventas del Mes"
          value={stats.totalSales?.value ?? 0}
          trend={stats.totalSales?.trend}
          icon={<FiShoppingBag />}
          colorAccent="success"
        />
        <StatCard
          label="Visitas Programadas"
          value={stats.scheduledVisits?.value ?? 0}
          trend={stats.scheduledVisits?.trend}
          icon={<FiMapPin />}
          colorAccent="warning"
        />
        <StatCard
          label="Comisiones"
          value={formatCurrency(stats.commissions?.value)}
          trend={stats.commissions?.trend}
          icon={<FiDollarSign />}
          colorAccent="info"
        />
      </div>

      <QuickActions />

      <div className={styles.dashboard__grid}>
        <SalesPerformanceChart />
        <UpcomingAppointments />
      </div>
    </div>
  );
}
