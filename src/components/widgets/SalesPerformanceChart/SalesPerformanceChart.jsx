import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useSalesSummary } from '../../../hooks/useSalesData';
import styles from './SalesPerformanceChart.module.scss';

export default function SalesPerformanceChart() {
  const { t } = useTranslation('dashboard');
  const { data: response, isLoading } = useSalesSummary();
  const chartData = response?.data?.monthlyData || [];

  return (
    <div className={styles.chart}>
      <div className={styles.chart__header}>
        <div>
          <h3 className={styles.chart__title}>{t('agent.salesPerformance.title')}</h3>
          <p className={styles.chart__subtitle}>{t('agent.salesPerformance.subtitle')}</p>
        </div>
      </div>
      <div className={styles.chart__body}>
        {isLoading ? (
          <p>{t('agent.salesPerformance.loading')}</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-stroke)" />
              <XAxis dataKey="month" stroke="var(--chart-axis-color)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--chart-axis-color)" fontSize={12} tickLine={false} axisLine={false}
                tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--chart-tooltip-bg)',
                  border: '1px solid var(--chart-tooltip-border)',
                  borderRadius: '8px',
                  color: 'var(--chart-tooltip-text)',
                }}
                formatter={(value) => [`$${(value / 1000000).toFixed(2)}M`, t('agent.stats.monthlySales')]}
              />
              <Bar dataKey="sales" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
