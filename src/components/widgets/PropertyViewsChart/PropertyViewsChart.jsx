import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTranslation } from 'react-i18next';
import styles from './PropertyViewsChart.module.scss';
import useOwnerProperties from '../../../hooks/useOwnerProperties';

export default function PropertyViewsChart() {
  const { t } = useTranslation('propertyViews');
  const { data: response, isLoading } = useOwnerProperties();
  const properties = response?.data || [];

  const chartData = properties.map((p) => ({
    name: p.title?.length > 15 ? p.title.slice(0, 15) + '…' : (p.title || t('emptyTitle')),
    views: p.views ?? 0,
    inquiries: p.inquiries ?? 0,
  }));

  return (
    <div className={styles.chart}>
      <h3 className={styles.chart__title}>{t('title')}</h3>
      <div className={styles.chart__container}>
        {isLoading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>{t('loading')}</p>
        ) : chartData.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>{t('empty')}</p>
        ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-stroke)" />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--chart-tooltip-bg)',
                border: '1px solid var(--chart-tooltip-border)',
                borderRadius: '8px',
                color: 'var(--chart-tooltip-text)',
                fontSize: '0.75rem',
              }}
            />
            <Bar dataKey="views" name={t('views')} fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="inquiries" name={t('inquiries')} fill="var(--color-success)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
