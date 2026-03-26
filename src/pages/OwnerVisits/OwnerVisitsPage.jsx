import Badge from '../../components/common/Badge/Badge';
import useOwnerVisits from '../../hooks/useOwnerVisits';
import { STATUS_COLORS } from '../../utils/constants';
import styles from './OwnerVisitsPage.module.scss';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OwnerVisitsPage() {
  const { data: response, isLoading, isError, error } = useOwnerVisits();
  const visits = response?.data || [];

  if (isLoading) {
    return (
      <div className={styles.visits}>
        <div className={styles.visits__loading}>Cargando solicitudes de visita...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.visits}>
        <div className={styles.visits__error}>
          <p>Error al cargar las solicitudes: {error?.message || 'Error desconocido'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.visits}>
      <div className={styles.visits__header}>
        <div>
          <h1 className={styles.visits__title}>Solicitudes de Visita</h1>
          <p className={styles.visits__subtitle}>
            Gestiona las solicitudes de visita recibidas
          </p>
        </div>
      </div>

      {visits.length === 0 ? (
        <div className={styles.visits__empty}>No hay solicitudes de visita</div>
      ) : (
        <div className={styles.visits__list}>
          {visits.map((visit) => (
            <div key={visit.id} className={styles.visits__card}>
              <div className={styles.visits__cardInfo}>
                <div className={styles.visits__cardProperty}>
                  {visit.propertyTitle}
                </div>
                <div className={styles.visits__cardVisitor}>
                  {visit.visitorName}
                </div>
                <div className={styles.visits__cardMessage}>
                  {visit.message}
                </div>
              </div>
              <div className={styles.visits__cardMeta}>
                <span className={styles.visits__cardDate}>
                  {formatDate(visit.date)}
                </span>
                <Badge variant={STATUS_COLORS[visit.status] || 'default'}>
                  {visit.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
