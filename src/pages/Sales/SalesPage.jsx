import { FiDollarSign, FiTrendingUp, FiFileText } from 'react-icons/fi';
import StatCard from '../../components/common/StatCard/StatCard';
import DataTable from '../../components/common/DataTable/DataTable';
import Badge from '../../components/common/Badge/Badge';
import { useSales, useSalesSummary } from '../../hooks/useSalesData';
import { STATUS_COLORS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import styles from './SalesPage.module.scss';

const COLUMNS = [
  { key: 'property', label: 'Propiedad' },
  { key: 'client', label: 'Cliente' },
  { key: 'amount', label: 'Monto', render: (v) => formatCurrency(v) },
  { key: 'commission', label: 'Comisión', render: (v) => formatCurrency(v) },
  { key: 'date', label: 'Fecha', render: (v) => formatDate(v) },
  {
    key: 'status',
    label: 'Estado',
    render: (v) => (
      <Badge variant={STATUS_COLORS[v] || 'neutral'}>
        {v === 'en_proceso' ? 'En Proceso' : v?.charAt(0).toUpperCase() + v?.slice(1)}
      </Badge>
    ),
  },
];

export default function SalesPage() {
  const { data: salesRes, isLoading } = useSales();
  const { data: summaryRes } = useSalesSummary();
  const sales = salesRes?.data || [];
  const summary = summaryRes?.data || {};

  return (
    <div className={styles.page}>
      <div className={styles.page__header}>
        <div>
          <h1 className={styles.page__title}>Ventas</h1>
          <p className={styles.page__subtitle}>Historial de contratos y comisiones</p>
        </div>
      </div>

      <div className={styles.page__stats}>
        <StatCard
          label="Total Vendido"
          value={formatCurrency(summary.totalSold)}
          icon={<FiDollarSign />}
          colorAccent="success"
        />
        <StatCard
          label="Comisiones del Mes"
          value={formatCurrency(summary.monthlyCommissions)}
          icon={<FiTrendingUp />}
          colorAccent="accent"
        />
        <StatCard
          label="Contratos Activos"
          value={summary.activeContracts ?? 0}
          icon={<FiFileText />}
          colorAccent="info"
        />
      </div>

      <div className={styles.page__card}>
        <DataTable
          columns={COLUMNS}
          data={sales}
          loading={isLoading}
          emptyMessage="No se encontraron contratos"
        />
      </div>
    </div>
  );
}
