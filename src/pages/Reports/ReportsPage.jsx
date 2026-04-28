import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { FiTrendingUp, FiHome, FiClock, FiPercent } from 'react-icons/fi';
import StatCard from '../../components/common/StatCard/StatCard';
import useReports from '../../hooks/useReports';
import { formatCurrency } from '../../utils/formatters';
import styles from './ReportsPage.module.scss';

const PIE_COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#0ea5e9', '#ef4444'];

export default function ReportsPage() {
  const { t } = useTranslation('reports');
  const { data: response, isLoading } = useReports();
  const report = response?.data || {};
  const metrics = report.marketMetrics || {};
  const pieData = report.propertyByType || [];
  const trendData = report.monthlyTrend || [];

  if (isLoading) return <p>{t('loading')}</p>;

  return (
    <div className={styles.page}>
      <div className={styles.page__header}>
        <div>
          <h1 className={styles.page__title}>{t('title')}</h1>
          <p className={styles.page__subtitle}>{t('subtitle')}</p>
        </div>
      </div>

      <div className={styles.page__stats}>
        <StatCard
          label={t('priceAverage')}
          value={formatCurrency(metrics.avgPrice)}
          trend={metrics.avgPriceTrend}
          icon={<FiTrendingUp />}
          colorAccent="accent"
        />
        <StatCard
          label={t('listedProperties')}
          value={metrics.propertiesListed ?? 0}
          trend={metrics.propertiesListedTrend}
          icon={<FiHome />}
          colorAccent="success"
        />
        <StatCard
          label={t('avgDays')}
          value={metrics.avgDaysOnMarket ?? 0}
          trend={metrics.avgDaysOnMarketTrend}
          icon={<FiClock />}
          colorAccent="warning"
        />
        <StatCard
          label={t('closingRate')}
          value={`${metrics.closingRate ?? 0}%`}
          trend={metrics.closingRateTrend}
          icon={<FiPercent />}
          colorAccent="info"
        />
      </div>

      <div className={styles.page__charts}>
        <div className={styles.page__chartCard}>
          <h3 className={styles.page__chartTitle}>{t('propertiesByType')}</h3>
          <div className={styles.page__chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--chart-tooltip-bg)',
                    border: '1px solid var(--chart-tooltip-border)',
                    borderRadius: '8px',
                    color: 'var(--chart-tooltip-text)',
                  }}
                />
                <Legend
                  wrapperStyle={{ color: 'var(--chart-axis-color)', fontSize: '0.8125rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.page__chartCard}>
          <h3 className={styles.page__chartTitle}>{t('monthlyTrend')}</h3>
          <div className={styles.page__chartBody}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-stroke)" />
                <XAxis dataKey="month" stroke="var(--chart-axis-color)" fontSize={12} />
                <YAxis stroke="var(--chart-axis-color)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--chart-tooltip-bg)',
                    border: '1px solid var(--chart-tooltip-border)',
                    borderRadius: '8px',
                    color: 'var(--chart-tooltip-text)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#2563eb' }}
                  name={t('sales')}
                />
                <Line
                  type="monotone"
                  dataKey="visitas"
                  stroke="var(--color-success)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#22c55e' }}
                  name={t('visits')}
                />
                <Legend wrapperStyle={{ color: 'var(--chart-axis-color)', fontSize: '0.8125rem' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
