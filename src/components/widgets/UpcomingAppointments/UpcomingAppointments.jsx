import useAppointments from '../../../hooks/useAppointments';
import { APPOINTMENT_COLORS } from '../../../utils/constants';
import { formatDateTime } from '../../../utils/formatters';
import styles from './UpcomingAppointments.module.scss';

export default function UpcomingAppointments() {
  const { data: response, isLoading } = useAppointments();
  const appointments = response?.data || [];

  if (isLoading) {
    return (
      <div className={styles.appointments}>
        <h3 className={styles.appointments__title}>Próximas Citas</h3>
        <p className={styles.appointments__empty}>Cargando...</p>
      </div>
    );
  }

  return (
    <div className={styles.appointments}>
      <h3 className={styles.appointments__title}>Próximas Citas</h3>
      {appointments.length === 0 ? (
        <p className={styles.appointments__empty}>No hay citas programadas</p>
      ) : (
        <div className={styles.appointments__list}>
          {appointments.slice(0, 5).map((apt) => (
            <div key={apt.id} className={styles.appointments__item}>
              <span
                className={styles.appointments__dot}
                style={{ background: APPOINTMENT_COLORS[apt.type] || '#6c63ff' }}
              />
              <div className={styles.appointments__info}>
                <p className={styles.appointments__itemTitle}>{apt.title}</p>
                <span className={styles.appointments__client}>{apt.clientName}</span>
              </div>
              <span className={styles.appointments__time}>
                {formatDateTime(apt.date)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
