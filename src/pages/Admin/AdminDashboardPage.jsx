import { Link, useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiHome,
  FiBarChart2,
  FiDollarSign,
  FiUserPlus,
  FiFlag,
  FiCheckCircle,
  FiAlertTriangle,
  FiSettings,
  FiFileText,
  FiArrowRight,
  FiCreditCard,
} from 'react-icons/fi';
import StatCard from '../../components/common/StatCard/StatCard';
import { ADMIN_ROUTES } from '../../utils/constants';
import useAdminDashboard from '../../hooks/useAdminDashboard';
import styles from './AdminDashboardPage.module.scss';

const QUICK_ICONS = {
  users: FiUsers,
  check: FiCheckCircle,
  warning: FiAlertTriangle,
  reports: FiBarChart2,
  card: FiCreditCard,
  settings: FiSettings,
  document: FiFileText,
};

const ACTIVITY_ICONS = {
  user: FiUserPlus,
  flag: FiFlag,
  payment: FiDollarSign,
};

function priorityBadgeClass(key) {
  if (key === 'urgent') return styles['badge--urgent'];
  if (key === 'medium') return styles['badge--medium'];
  if (key === 'low') return styles['badge--low'];
  return styles['badge--high'];
}

export default function AdminDashboardPage() {
  const { data: response, isLoading, isError, error } = useAdminDashboard();
  const overview = response?.data;
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <header className={styles.hero}>
          <h1 className={styles.hero__title}>Panel de Administración</h1>
          <p className={styles.hero__subtitle}>
            Vista general del sistema y estadísticas principales
          </p>
        </header>

        {isLoading && <div className={styles.state}>Cargando resumen…</div>}

        {isError && (
          <div className={styles.stateError}>
            {error?.response?.status === 403
              ? 'No tenés permisos para ver este panel.'
              : 'No se pudo cargar el panel. Intentá de nuevo más tarde.'}
          </div>
        )}

        {overview && (
          <>
            <section className={styles.stats} aria-label="Indicadores">
              <StatCard
                label="Usuarios"
                value={overview.users?.valueLabel ?? '—'}
                subtitle={overview.users?.subtitle}
                trend={overview.users?.trendPercent}
                hint={overview.users?.weekHint}
                icon={<FiUsers />}
                colorAccent="accent"
              />
              <StatCard
                label="Propiedades"
                value={overview.properties?.valueLabel ?? '—'}
                subtitle={overview.properties?.subtitle}
                trend={overview.properties?.trendPercent}
                hint={overview.properties?.weekHint}
                icon={<FiHome />}
                colorAccent="success"
              />
              <StatCard
                label="Transacciones"
                value={overview.transactions?.valueLabel ?? '—'}
                subtitle={overview.transactions?.subtitle}
                trend={overview.transactions?.trendPercent}
                hint={overview.transactions?.weekHint}
                icon={<FiBarChart2 />}
                colorAccent="warning"
              />
              <StatCard
                label="Ingresos"
                value={overview.revenue?.valueLabel ?? '—'}
                subtitle={overview.revenue?.subtitle}
                trend={overview.revenue?.trendPercent}
                hint={overview.revenue?.weekHint}
                icon={<FiDollarSign />}
                colorAccent="info"
              />
            </section>

            <div className={styles.columns}>
              <section className={styles.panel} aria-labelledby="admin-quick-title">
                <h2 id="admin-quick-title" className={styles.panel__title}>
                  Acciones rápidas
                </h2>
                <div className={styles.quickList}>
                  {(overview.quickActions ?? []).map((action) => {
                    const Icon = QUICK_ICONS[action.iconKey] || FiFileText;
                    const resolvedPath =
                      action.title === 'Ver reportes'
                        ? ADMIN_ROUTES.FLAGS
                        : action.path;
                    const inner = (
                      <>
                        <span className={styles.quickRow__icon}>
                          <Icon />
                        </span>
                        <span className={styles.quickRow__body}>
                          <span className={styles.quickRow__label}>{action.title}</span>
                          <span className={styles.quickRow__sub}>{action.subtitle}</span>
                        </span>
                      </>
                    );
                    if (resolvedPath) {
                      return (
                        <Link key={action.title} to={resolvedPath} className={styles.quickRow}>
                          {inner}
                        </Link>
                      );
                    }
                    return (
                      <button
                        key={action.title}
                        type="button"
                        className={styles.quickRow}
                        disabled
                        title="Próximamente"
                      >
                        {inner}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className={styles.panel} aria-labelledby="admin-activity-title">
                <h2 id="admin-activity-title" className={styles.panel__title}>
                  Actividad reciente
                </h2>
                <div className={styles.activityList}>
                  {(overview.recentActivity ?? []).map((item) => {
                    const Icon = ACTIVITY_ICONS[item.iconKey] || FiFileText;
                    return (
                      <div key={`${item.title}-${item.dateLabel}`} className={styles.activityRow}>
                        <span className={styles.activityRow__icon}>
                          <Icon aria-hidden />
                        </span>
                        <div>
                          <div className={styles.activityRow__title}>
                            {item.title}
                            {item.detail ? `: ${item.detail}` : ''}
                          </div>
                          <div className={styles.activityRow__date}>{item.dateLabel}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link to={ADMIN_ROUTES.AUDIT_LOGS} className={styles.footerLink}>
                  Ver todo el historial <FiArrowRight aria-hidden className={styles.activityFooterArrow} />
                </Link>
              </section>

              <section className={styles.panel} aria-labelledby="admin-attention-title">
                <h2 id="admin-attention-title" className={styles.panel__title}>
                  Requiere atención
                </h2>
                <div className={styles.attentionList}>
                  {(overview.attentionItems ?? []).length === 0 ? (
                    <p className={styles.emptyAttention}>No hay propiedades que requieran atención en estos estados.</p>
                  ) : (
                    (overview.attentionItems ?? []).map((item) => (
                      <Link
                        key={item.propertyId}
                        to={`/properties/${item.propertyId}`}
                        className={styles.attentionCard}
                      >
                        <div className={styles.attentionCard__meta}>{item.statusLabel}</div>
                        <div className={styles.attentionCard__title}>{item.title}</div>
                        <p className={styles.attentionCard__desc}>{item.description}</p>
                        <span className={`${styles.badge} ${priorityBadgeClass(item.priorityKey)}`}>
                          {item.priorityLabel}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
                <button
                  type="button"
                  className={styles.footerLink}
                  onClick={() => navigate(ADMIN_ROUTES.APPROVAL)}
                >
                  Ver todas las tareas <FiArrowRight aria-hidden />
                </button>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
