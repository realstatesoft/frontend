import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronDown, FiChevronUp, FiCalendar, FiUser, FiStar, FiClock } from 'react-icons/fi';
import Badge from '../../../components/common/Badge/Badge';
import Button from '../../../components/common/Button/Button';
import useFormatters from '../../../hooks/useFormatters';
import styles from './TicketList.module.scss';

const STATUS_VARIANTS = {
  SUBMITTED: 'neutral',
  ACKNOWLEDGED: 'info',
  IN_PROGRESS: 'warning',
  ON_HOLD: 'accent',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const STATUS_LABELS = {
  SUBMITTED: 'Enviada',
  ACKNOWLEDGED: 'Recibida',
  IN_PROGRESS: 'En Progreso',
  ON_HOLD: 'En Espera',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

const PRIORITY_VARIANTS = {
  LOW: 'neutral',
  MEDIUM: 'info',
  HIGH: 'warning',
  EMERGENCY: 'danger',
};

const PRIORITY_LABELS = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  EMERGENCY: 'Emergencia',
};

function TicketItem({ ticket, onRate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rating, setRating] = useState(0);
  const { formatDate } = useFormatters();

  const handleRate = (e) => {
    e.preventDefault();
    onRate(ticket.id, rating);
  };

  return (
    <div className={`${styles.ticketItem} ${isExpanded ? styles.expanded : ''}`}>
      <div className={styles.ticketHeader} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={styles.ticketMain}>
          <div className={styles.ticketTitleRow}>
            <h4>{ticket.title}</h4>
            <div className={styles.badges}>
              <Badge variant={PRIORITY_VARIANTS[ticket.priority]}>{PRIORITY_LABELS[ticket.priority]}</Badge>
              <Badge variant={STATUS_VARIANTS[ticket.status]}>{STATUS_LABELS[ticket.status]}</Badge>
            </div>
          </div>
          <p className={styles.ticketMeta}>
            <FiCalendar /> {formatDate(ticket.createdAt)} • {ticket.category}
          </p>
        </div>
        <div className={styles.toggleIcon}>
          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>
      </div>

      {isExpanded && (
        <div className={styles.ticketDetails}>
          <div className={styles.description}>
            <p>{ticket.description}</p>
          </div>

          {ticket.vendor && (
            <div className={styles.vendorInfo}>
              <h5>Técnico Asignado</h5>
              <div className={styles.vendorContent}>
                <div className={styles.vendorAvatar}>
                  <FiUser />
                </div>
                <div className={styles.vendorText}>
                  <p className={styles.vendorName}>{ticket.vendor.name}</p>
                  <p className={styles.vendorContact}>{ticket.vendor.phone} • {ticket.vendor.email}</p>
                </div>
              </div>
            </div>
          )}

          <div className={styles.timeline}>
            <h5>Historial de Actualizaciones</h5>
            <div className={styles.timelineList}>
              {ticket.statusHistory?.map((entry, idx) => (
                <div key={idx} className={styles.timelineItem}>
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineContent}>
                    <p className={styles.timelineStatus}>{STATUS_LABELS[entry.status] || entry.status}</p>
                    <p className={styles.timelineTime}>{formatDate(entry.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {ticket.status === 'COMPLETED' && !ticket.rating && (
            <div className={styles.ratingSection}>
              <h5>¿Cómo calificarías el servicio?</h5>
              <form onSubmit={handleRate} className={styles.ratingForm}>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={star <= rating ? styles.starActive : ''}
                      onClick={() => setRating(star)}
                    >
                      <FiStar />
                    </button>
                  ))}
                </div>
                <Button size="sm" type="submit" disabled={rating === 0}>
                  Enviar Calificación
                </Button>
              </form>
            </div>
          )}

          {ticket.rating && (
            <div className={styles.ratedSection}>
              <h5>Calificación enviada</h5>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar key={star} className={star <= ticket.rating ? styles.starActive : ''} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TicketList({ tickets, onRate }) {
  if (!tickets || tickets.length === 0) {
    return (
      <div className={styles.empty}>
        <FiClock className={styles.emptyIcon} />
        <p>No tienes solicitudes de mantenimiento registradas.</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {tickets.map((ticket) => (
        <TicketItem key={ticket.id} ticket={ticket} onRate={onRate} />
      ))}
    </div>
  );
}
