import { useState, useMemo } from 'react';
import { FiDollarSign, FiTrendingUp, FiFileText, FiCheckCircle } from 'react-icons/fi';
import StatCard from '../../components/common/StatCard/StatCard';
import DataTable from '../../components/common/DataTable/DataTable';
import Badge from '../../components/common/Badge/Badge';
import { useSales, useSalesSummary } from '../../hooks/useSalesData';
import {
  CONTRACT_TYPE_LABELS,
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_COLORS,
} from '../../constants/contractConstants';
import useFormatters from '../../hooks/useFormatters';
import styles from './SalesPage.module.scss';

const ROLE_LABELS = {
  LISTING_AGENT: 'Agente listador',
  BUYER_AGENT: 'Agente comprador',
  SELLER: 'Vendedor',
  BUYER: 'Comprador',
  PARTICIPANT: 'Participante',
};

const ROLE_COLORS = {
  LISTING_AGENT: 'accent',
  BUYER_AGENT: 'info',
  SELLER: 'success',
  BUYER: 'warning',
  PARTICIPANT: 'neutral',
};

const FILTER_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'SIGNED', label: 'Firmados' },
  { value: 'ACTIVE', label: 'Activos (en proceso)' },
];

export default function SalesPage() {
  const { data: salesRes, isLoading } = useSales();
  const { data: summaryRes } = useSalesSummary();
  const [filter, setFilter] = useState('');
  const { formatCurrency, formatDate } = useFormatters();

  const sales = salesRes?.data ?? [];
  const summary = summaryRes?.data ?? {};
  const monthlyData = summary.monthlyData ?? [];

  const filtered = useMemo(() => {
    if (!filter) return sales;
    if (filter === 'SIGNED') return sales.filter((s) => s.status === 'SIGNED');
    if (filter === 'ACTIVE')
      return sales.filter((s) =>
        ['DRAFT', 'SENT', 'PARTIALLY_SIGNED'].includes(s.status),
      );
    return sales;
  }, [sales, filter]);

  const COLUMNS = [
    {
      key: 'property',
      label: 'Propiedad',
      render: (v) => <span className={styles.sales__propName}>{v || '-'}</span>,
    },
    {
      key: 'contractType',
      label: 'Tipo',
      render: (v) => (
        <Badge variant={v === 'SALE' ? 'info' : v === 'RENT' ? 'accent' : 'neutral'}>
          {CONTRACT_TYPE_LABELS[v] || v}
        </Badge>
      ),
    },
    {
      key: 'buyer',
      label: 'Comprador',
      render: (v) => v || '-',
    },
    {
      key: 'seller',
      label: 'Vendedor',
      render: (v) => v || '-',
    },
    {
      key: 'amount',
      label: 'Monto',
      render: (v) => <span className={styles.sales__amount}>{formatCurrency(v)}</span>,
    },
    {
      key: 'myCommission',
      label: 'Mi comisión',
      render: (v) => (
        <span className={styles.sales__commission}>{formatCurrency(v)}</span>
      ),
    },
    {
      key: 'myRole',
      label: 'Mi rol',
      render: (v) => (
        <Badge variant={ROLE_COLORS[v] || 'neutral'}>
          {ROLE_LABELS[v] || v}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (v) => (
        <Badge variant={CONTRACT_STATUS_COLORS[v] || 'neutral'}>
          {CONTRACT_STATUS_LABELS[v] || v}
        </Badge>
      ),
    },
    {
      key: 'date',
      label: 'Fecha',
      render: (v) => formatDate(v),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.page__header}>
        <div>
          <h1 className={styles.page__title}>Ventas y Comisiones</h1>
          <p className={styles.page__subtitle}>
            Resumen financiero de todos tus contratos
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className={styles.page__stats}>
        <StatCard
          label="Total Vendido"
          value={formatCurrency(summary.totalSold)}
          icon={<FiDollarSign />}
          colorAccent="success"
        />
        <StatCard
          label="Mis Comisiones"
          value={formatCurrency(summary.totalCommissions)}
          icon={<FiTrendingUp />}
          colorAccent="accent"
        />
        <StatCard
          label="Contratos Firmados"
          value={summary.signedContracts ?? 0}
          icon={<FiCheckCircle />}
          colorAccent="info"
        />
        <StatCard
          label="Contratos Activos"
          value={summary.activeContracts ?? 0}
          icon={<FiFileText />}
          colorAccent="warning"
        />
      </div>

      {/* ── Monthly chart ── */}
      {monthlyData.length > 0 && (
        <div className={styles.chart}>
          <h2 className={styles.chart__title}>Últimos 6 meses</h2>
          <div className={styles.chart__bars}>
            {monthlyData.map((m) => {
              const maxVal = Math.max(...monthlyData.map((d) => d.sales), 1);
              const pct = Math.round((m.sales / maxVal) * 100);
              return (
                <div key={m.month} className={styles.chart__col}>
                  <div className={styles.chart__barWrap}>
                    <div
                      className={styles.chart__bar}
                      style={{ height: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <span className={styles.chart__label}>{m.month}</span>
                  <span className={styles.chart__value}>
                    {formatCurrency(m.sales)}
                  </span>
                  {m.commissions > 0 && (
                    <span className={styles.chart__comm}>
                      +{formatCurrency(m.commissions)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Data table ── */}
      <div className={styles.page__card}>
        <div className={styles.page__toolbar}>
          <h2 className={styles.page__sectionTitle}>Historial de contratos</h2>
          <select
            className={styles.page__filter}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <DataTable
          columns={COLUMNS}
          data={filtered}
          loading={isLoading}
          emptyMessage="No se encontraron contratos"
        />
      </div>
    </div>
  );
}
