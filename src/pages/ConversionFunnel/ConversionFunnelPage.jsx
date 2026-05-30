import { Fragment, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import Badge from '../../components/common/Badge/Badge';
import Button from '../../components/common/Button/Button';
import useConversionFunnel from '../../hooks/useConversionFunnel';
import { formatCurrency } from '../../utils/formatters';
import styles from './ConversionFunnelPage.module.scss';
import NumericInput from '../../components/common/NumericInput';

const PROPERTY_TYPES = ['HOUSE', 'APARTMENT', 'LAND', 'OFFICE', 'WAREHOUSE', 'FARM'];

const FUNNEL_BLUES = ['#93b4ff', '#6b8ef5', '#3d62dd', '#1a3070'];

function funnelLocale(language) {
  if (!language || String(language).toLowerCase().startsWith('es')) return 'es-PY';
  const l = String(language).toLowerCase();
  if (l === 'pr' || l.startsWith('pt')) return 'pt-BR';
  return 'en-US';
}

function formatFunnelInteger(n, language) {
  return Number(n ?? 0).toLocaleString(funnelLocale(language), { maximumFractionDigits: 0 });
}

function formatFunnelDecimal(n, language, opts = { min: 1, max: 1 }) {
  if (n == null || Number.isNaN(Number(n))) return '';
  return Number(n).toLocaleString(funnelLocale(language), {
    minimumFractionDigits: opts.min,
    maximumFractionDigits: opts.max,
  });
}

function ymdLocal(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfMonth() {
  const d = new Date();
  return ymdLocal(new Date(d.getFullYear(), d.getMonth(), 1));
}

function defaultForm() {
  return {
    from: startOfMonth(),
    to: ymdLocal(),
    granularity: 'MONTH',
    comparePrevious: true,
    locationId: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
  };
}

function statusToBadgeVariant(status) {
  const s = String(status || '').toUpperCase();
  const map = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    PUBLISHED: 'info',
    ACTIVE: 'success',
    SOLD: 'accent',
    RENTED: 'accent',
    ARCHIVED: 'neutral',
  };
  return map[s] || 'neutral';
}

export default function ConversionFunnelPage() {
  const { t, i18n } = useTranslation('funnel');
  const [form, setForm] = useState(defaultForm);
  const [applied, setApplied] = useState(defaultForm);
  const [topPage, setTopPage] = useState(0);

  const funnelFilters = useMemo(
    () => ({
      ...applied,
      topPage,
      topSize: 10,
    }),
    [applied, topPage],
  );

  const { summaryQuery, topQuery } = useConversionFunnel(funnelFilters);

  const summary = summaryQuery.data;
  const curr = summary?.current;
  const rates = summary?.rates;
  const kpis = summary?.kpis;
  const series = summary?.series || [];

  const lineData = series.map((p) => ({
    period: p.periodLabel,
    vistas: p.views,
    visitas: p.visits,
    ofertas: p.offers,
    ventas: p.sales,
  }));

  const maxFunnel = useMemo(() => {
    if (!curr) return 1;
    return Math.max(curr.views || 1, curr.visits || 0, curr.offers || 0, curr.sales || 0, 1);
  }, [curr]);

  const funnelRows = curr
    ? [
        {
          key: 'views',
          value: curr.views,
          color: FUNNEL_BLUES[0],
          stepRate: null,
          dropPct: null,
        },
        {
          key: 'visits',
          value: curr.visits,
          color: FUNNEL_BLUES[1],
          stepRate: rates?.viewsToVisitsPct,
          dropPct:
            curr.views > 0 ? Math.max(0, 100 - (100 * curr.visits) / curr.views) : null,
        },
        {
          key: 'offers',
          value: curr.offers,
          color: FUNNEL_BLUES[2],
          stepRate: rates?.visitsToOffersPct,
          dropPct:
            curr.visits > 0 ? Math.max(0, 100 - (100 * curr.offers) / curr.visits) : null,
        },
        {
          key: 'sales',
          value: curr.sales,
          color: FUNNEL_BLUES[3],
          stepRate: rates?.offersToSalesPct,
          dropPct:
            curr.offers > 0 ? Math.max(0, 100 - (100 * curr.sales) / curr.offers) : null,
        },
      ]
    : [];

  const trendLegendRows = curr
    ? [
        { dataKey: 'vistas', label: t('stagesFunnel.views'), color: FUNNEL_BLUES[0], total: curr.views },
        { dataKey: 'visitas', label: t('stagesFunnel.visits'), color: FUNNEL_BLUES[1], total: curr.visits },
        { dataKey: 'ofertas', label: t('stagesFunnel.offers'), color: FUNNEL_BLUES[2], total: curr.offers },
        { dataKey: 'ventas', label: t('stagesFunnel.sales'), color: FUNNEL_BLUES[3], total: curr.sales },
      ]
    : [];

  const submitFilters = (e) => {
    e?.preventDefault();
    setApplied({ ...form });
    setTopPage(0);
  };

  const topPageData = topQuery.data;
  const totalTop = Number(topPageData?.totalElements) || 0;
  const pageSize = Number(topPageData?.size) || 10;
  const totalPages = Math.max(1, Math.ceil(totalTop / pageSize));

  if (summaryQuery.isPending && !summaryQuery.data) {
    return (
      <div className={styles.loadingWrapper} role="status">
        <div className={styles.spinner} aria-hidden />
        <span>{t('loading')}</span>
      </div>
    );
  }

  if (summaryQuery.isError) {
    return (
      <div className={styles.error} role="alert">
        {t('error')}
      </div>
    );
  }

  const formatPctOrDash = (v) => (v == null ? '–' : `${Number(v).toFixed(2)}%`);

  return (
    <div className={styles.page}>
      <header className={styles.page__header}>
        <div>
          <p className={styles.page__breadcrumb}>{t('breadcrumb')}</p>
          <h1 className={styles.page__title}>{t('title')}</h1>
          <p className={styles.page__subtitle}>{t('subtitle')}</p>
        </div>
      </header>

      <form className={styles.filtersBar} onSubmit={submitFilters}>
        <div className={styles.filterGroup}>
          <label htmlFor="cf-from">{t('filters.from')}</label>
          <input
            id="cf-from"
            className={styles.filterInput}
            type="date"
            value={form.from}
            onChange={(ev) => setForm((s) => ({ ...s, from: ev.target.value }))}
            required
          />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="cf-to">{t('filters.to')}</label>
          <input
            id="cf-to"
            className={styles.filterInput}
            type="date"
            value={form.to}
            onChange={(ev) => setForm((s) => ({ ...s, to: ev.target.value }))}
            required
          />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="cf-gran">{t('filters.granularity')}</label>
          <select
            id="cf-gran"
            className={styles.filterSelect}
            value={form.granularity}
            onChange={(ev) => setForm((s) => ({ ...s, granularity: ev.target.value }))}
          >
            <option value="DAY">{t('filters.granularity_DAY')}</option>
            <option value="WEEK">{t('filters.granularity_WEEK')}</option>
            <option value="MONTH">{t('filters.granularity_MONTH')}</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="cf-loc">{t('filters.location')}</label>
          <NumericInput
            plainInput
            id="cf-loc"
            className={styles.filterInput}
            placeholder={t('filters.locationPlaceholder')}
            value={form.locationId}
            onChange={(ev) => setForm((s) => ({ ...s, locationId: ev.target.value }))}
          />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="cf-ptype">{t('filters.propertyType')}</label>
          <select
            id="cf-ptype"
            className={styles.filterSelect}
            value={form.propertyType}
            onChange={(ev) => setForm((s) => ({ ...s, propertyType: ev.target.value }))}
          >
            <option value="">{t('filters.propertyType_any')}</option>
            {PROPERTY_TYPES.map((code) => (
              <option key={code} value={code}>
                {t(`filters.propertyTypes.${code}`)}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="cf-minp">{t('filters.minPrice')}</label>
          <NumericInput
            plainInput
            allowDecimal
            id="cf-minp"
            className={styles.filterInput}
            value={form.minPrice}
            onChange={(ev) => setForm((s) => ({ ...s, minPrice: ev.target.value }))}
          />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="cf-maxp">{t('filters.maxPrice')}</label>
          <NumericInput
            plainInput
            allowDecimal
            id="cf-maxp"
            className={styles.filterInput}
            value={form.maxPrice}
            onChange={(ev) => setForm((s) => ({ ...s, maxPrice: ev.target.value }))}
          />
        </div>
        <div className={`${styles.filterGroup} ${styles.checkboxGroup}`}>
          <div className={styles.checkboxRow}>
            <input
              id="cf-compare"
              type="checkbox"
              checked={form.comparePrevious}
              onChange={(ev) =>
                setForm((s) => ({ ...s, comparePrevious: ev.target.checked }))
              }
            />
            <label htmlFor="cf-compare">{t('filters.comparePrevious')}</label>
          </div>
        </div>
        <div className={styles.filtersActions}>
          <Button variant="primary" type="submit" disabled={summaryQuery.isFetching}>
            {t('filters.apply')}
          </Button>
        </div>
      </form>

      <div className={styles.page__grid}>
        <div className={`${styles.page__chartCard} ${styles.funnelPanel}`}>
          <h2 className={styles.cardTitle}>{t('funnelChartTitle')}</h2>
          <div className={styles.funnelVisual}>
            {funnelRows.map((row, idx) => {
              const wPct = Math.min(100, (100 * Number(row.value)) / maxFunnel);
              return (
                <Fragment key={row.key}>
                  {idx > 0 && row.dropPct != null ? (
                    <div className={styles.funnelDropLine}>{t('dropLine', { pct: formatFunnelDecimal(row.dropPct, i18n.language) })}</div>
                  ) : null}
                  <div className={styles.funnelStageRow}>
                    <div className={styles.stageName}>{t(`stagesFunnel.${row.key}`)}</div>
                    <div className={styles.barCell}>
                      <div className={styles.barTrack}>
                        <div
                          className={`${styles.barFill} ${row.value > 0 ? styles.barFillNonZero : ''}`}
                          style={{
                            width: `${wPct}%`,
                            backgroundColor: row.color,
                          }}
                        >
                          {row.value > 0 ? (
                            <span className={styles.barInnerValue}>
                              {formatFunnelInteger(row.value, i18n.language)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className={styles.stepRateCell}>
                      {idx > 0 && row.stepRate != null ? (
                        <span className={styles.stepRateValue}>
                          {formatFunnelDecimal(row.stepRate, i18n.language)}%
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Fragment>
              );
            })}
          </div>

          {kpis ? (
            <div className={styles.funnelKpis}>
              <div className={styles.funnelKpiCol}>
                <div className={styles.funnelKpiLabel}>{t('kpis.labelGlobalShort')}</div>
                <div className={styles.funnelKpiValue}>{formatPctOrDash(kpis.globalConversionPct)}</div>
                {kpis.globalConversionPctDeltaPp != null ? (
                  <div
                    className={
                      kpis.globalConversionPctDeltaPp > 0
                        ? styles.kpiDeltaUp
                        : kpis.globalConversionPctDeltaPp < 0
                          ? styles.kpiDeltaDown
                          : styles.kpiDeltaMuted
                    }
                  >
                    {kpis.globalConversionPctDeltaPp > 0
                      ? '↑ '
                      : kpis.globalConversionPctDeltaPp < 0
                        ? '↓ '
                        : ''}
                    {formatFunnelDecimal(Math.abs(kpis.globalConversionPctDeltaPp), i18n.language, {
                      min: 2,
                      max: 2,
                    })}{' '}
                    pp · {t('kpis.vsPrevAbbr')}
                  </div>
                ) : null}
              </div>
              <div className={styles.funnelKpiCol}>
                <div className={styles.funnelKpiLabel}>{t('kpis.labelMedianShort')}</div>
                <div className={styles.funnelKpiValue}>
                  {kpis.medianDaysViewToSale != null
                    ? `${formatFunnelDecimal(kpis.medianDaysViewToSale, i18n.language, { min: 0, max: 1 })} ${t('kpis.daysUnit')}`
                    : t('kpis.noMedian')}
                </div>
                {kpis.medianDaysViewToSaleDelta != null ? (
                  <div
                    className={
                      kpis.medianDaysViewToSaleDelta < 0
                        ? styles.kpiDeltaUp
                        : kpis.medianDaysViewToSaleDelta > 0
                          ? styles.kpiDeltaDown
                          : styles.kpiDeltaMuted
                    }
                  >
                    {kpis.medianDaysViewToSaleDelta > 0 ? '↓ ' : kpis.medianDaysViewToSaleDelta < 0 ? '↑ ' : ''}
                    {kpis.medianDaysViewToSaleDelta !== 0
                      ? `${formatFunnelDecimal(Math.abs(kpis.medianDaysViewToSaleDelta), i18n.language, { min: 1, max: 1 })} ${t('kpis.daysUnit')}`
                      : '0'}{' '}
                    · {t('kpis.vsPrevAbbr')}
                  </div>
                ) : null}
              </div>
              <div className={styles.funnelKpiCol}>
                <div className={styles.funnelKpiLabel}>{t('kpis.labelVolumeShort')}</div>
                <div className={styles.funnelKpiValue}>{formatCurrency(kpis.closedVolume)}</div>
                {kpis.closedVolumePctChange != null ? (
                  <div
                    className={
                      kpis.closedVolumePctChange > 0
                        ? styles.kpiDeltaUp
                        : kpis.closedVolumePctChange < 0
                          ? styles.kpiDeltaDown
                          : styles.kpiDeltaMuted
                    }
                  >
                    {kpis.closedVolumePctChange > 0
                      ? '↑ '
                      : kpis.closedVolumePctChange < 0
                        ? '↓ '
                        : ''}
                    {formatFunnelDecimal(Math.abs(kpis.closedVolumePctChange), i18n.language, { min: 1, max: 1 })}% ·{' '}
                    {t('kpis.vsPrevAbbr')}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className={`${styles.page__chartCard} ${styles.trendPanel}`}>
          <h2 className={styles.cardTitle}>{t('trendTitle')}</h2>
          <div className={styles.chartLegendRow}>
            <div className={styles.chartMain}>
              {lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 12, right: 4, bottom: 8, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis dataKey="period" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="vistas"
                      name={t('stagesFunnel.views')}
                      stroke={FUNNEL_BLUES[0]}
                      dot={false}
                      strokeWidth={2.25}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="visitas"
                      name={t('stagesFunnel.visits')}
                      stroke={FUNNEL_BLUES[1]}
                      dot={false}
                      strokeWidth={2.25}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="ofertas"
                      name={t('stagesFunnel.offers')}
                      stroke={FUNNEL_BLUES[2]}
                      dot={false}
                      strokeWidth={2.25}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="ventas"
                      name={t('stagesFunnel.sales')}
                      stroke={FUNNEL_BLUES[3]}
                      dot={false}
                      strokeWidth={2.25}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.chartEmpty}>{t('table.empty')}</div>
              )}
            </div>
            {curr ? (
              <ul className={styles.seriesLegend} aria-label={t('trendTitle')}>
                {trendLegendRows.map((leg) => (
                  <li key={leg.dataKey} className={styles.seriesLegendItem}>
                    <span className={styles.seriesSwatch} style={{ backgroundColor: leg.color }} />
                    <span className={styles.seriesLegendName}>{leg.label}</span>
                    <span className={styles.seriesLegendTotal}>
                      {formatFunnelInteger(leg.total, i18n.language)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      <section className={styles.tableCard} aria-labelledby="funnel-table-title">
        <div className={styles.tableHeader}>
          <h2 className={styles.cardTitle} id="funnel-table-title">
            {t('table.title')}
          </h2>
        </div>
        {topQuery.isPending ? (
          <div className={styles.loadingWrapper} role="status">
            <div className={styles.spinner} aria-hidden />
            <span>{t('loading')}</span>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('table.property')}</th>
                    <th>{t('table.status')}</th>
                    <th>{t('table.views')}</th>
                    <th>{t('table.visits')}</th>
                    <th>{t('table.offers')}</th>
                    <th>{t('table.sales')}</th>
                    <th>{t('table.conv')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(topPageData?.content || []).map((row) => (
                    <tr key={row.propertyId}>
                      <td className={styles.propCell}>
                        <Link className={styles.propTitle} to={`/properties/${row.propertyId}`}>
                          {row.title}
                        </Link>
                        <div className={styles.propAddr}>{row.address}</div>
                      </td>
                      <td>
                        <Badge variant={statusToBadgeVariant(row.status)}>{row.status}</Badge>
                      </td>
                      <td>{row.views}</td>
                      <td>{row.visits}</td>
                      <td>{row.offers}</td>
                      <td>{row.sales}</td>
                      <td>{row.conversionFromViewsPct != null ? `${Number(row.conversionFromViewsPct).toFixed(2)}%` : '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!topPageData?.content?.length ? (
              <p className={styles.tableEmptyNote}>{t('table.empty')}</p>
            ) : null}
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.paginationBtn}
                disabled={topPage <= 0}
                onClick={() => setTopPage((p) => Math.max(0, p - 1))}
              >
                {t('table.prev')}
              </button>
              <button
                type="button"
                className={styles.paginationBtn}
                disabled={topPage >= totalPages - 1}
                onClick={() => setTopPage((p) => p + 1)}
              >
                {t('table.next')}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
