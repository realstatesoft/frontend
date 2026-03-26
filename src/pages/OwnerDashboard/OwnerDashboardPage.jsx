import { FiHome, FiEye, FiMessageCircle, FiTrendingUp } from 'react-icons/fi';
import StatCard from '../../components/common/StatCard/StatCard';
import OwnerQuickActions from '../../components/widgets/OwnerQuickActions/OwnerQuickActions';
import UpsellBanner from '../../components/widgets/UpsellBanner/UpsellBanner';
import PropertyViewsChart from '../../components/widgets/PropertyViewsChart/PropertyViewsChart';
import useOwnerStats from '../../hooks/useOwnerStats';
import styles from './OwnerDashboardPage.module.scss';

export default function OwnerDashboardPage() {
  const { data: response } = useOwnerStats();
  const stats = response?.data || {};

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboard__header}>
        <div>
          <h1 className={styles.dashboard__title}>Mi Panel</h1>
          <p className={styles.dashboard__subtitle}>Resumen de tus propiedades</p>
        </div>
      </div>

      <div className={styles.dashboard__stats}>
        <StatCard
          label="Mis Propiedades"
          value={stats.myProperties?.value ?? 0}
          trend={stats.myProperties?.trend}
          icon={<FiHome />}
          colorAccent="accent"
        />
        <StatCard
          label="Visitas Recibidas"
          value={stats.totalVisits?.value ?? 0}
          trend={stats.totalVisits?.trend}
          icon={<FiEye />}
          colorAccent="success"
        />
        <StatCard
          label="Consultas"
          value={stats.inquiries?.value ?? 0}
          trend={stats.inquiries?.trend}
          icon={<FiMessageCircle />}
          colorAccent="warning"
        />
        <StatCard
          label="Vistas Totales"
          value={stats.views?.value ?? 0}
          trend={stats.views?.trend}
          icon={<FiTrendingUp />}
          colorAccent="info"
        />
      </div>

      <OwnerQuickActions />

      <div className={styles.dashboard__grid}>
        <PropertyViewsChart />
        <UpsellBanner />
      </div>
    </div>
  );
}
