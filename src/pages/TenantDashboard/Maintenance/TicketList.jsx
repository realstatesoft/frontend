import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCalendar, FiUser, FiStar, FiClock, FiImage } from 'react-icons/fi';
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

function getTicketImages(ticket) {
  if (Array.isArray(ticket?.images)) {
    return ticket.images.filter(Boolean);
  }
  return [];
}

function TicketDetails({ ticket, onRate }) {
  const [rating, setRating] = useState(0);
  const { formatDate } = useFormatters();
  const images = useMemo(() => getTicketImages(ticket), [ticket]);

  const handleRate = async (e) => {
    e.preventDefault();
    if (!rating) return;
    await onRate(ticket.id, rating);
    setRating(0);
  };

  return (
    <section className={styles.detailsPane}>
      <div className={styles.detailsHeader}>
        <div>
          <h4>{ticket.title}</h4>
          <p className={styles.ticketMeta}>
            <FiCalendar /> {formatDate(ticket.createdAt)}
          </p>
        </div>
        <div className={styles.badges}>
          <Badge variant={PRIORITY_VARIANTS[ticket.priority]}>{PRIORITY_LABELS[ticket.priority] || ticket.priority}</Badge>
          <Badge variant={STATUS_VARIANTS[ticket.status]}>{STATUS_LABELS[ticket.status] || ticket.status}</Badge>
        </div>
      </div>

      <div className={styles.description}>
        <h5>Descripcion</h5>
        <p>{ticket.description}</p>
      </div>

      {images.length > 0 && (
        <div className={styles.imageSection}>
          <h5>
            <FiImage /> Evidencia adjunta
          </h5>
          <div className={styles.imageGrid}>
            {images.map((src, idx) => (
              <a key={`${src}-${idx}`} href={src} target="_blank" rel="noreferrer" className={styles.imageItem}>
                <img src={src} alt={`Imagen de mantenimiento ${idx + 1}`} loading="lazy" />
              </a>
            ))}
          </div>
        </div>
      )}

      {ticket.vendor && (
        <div className={styles.vendorInfo}>
          <h5>Tecnico asignado</h5>
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
        <h5>Historial de actualizaciones</h5>
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
          <h5>Como calificarias el servicio?</h5>
          <form onSubmit={handleRate} className={styles.ratingForm}>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={star <= rating ? styles.starActive : ''}
                  onClick={() => setRating(star)}
                  aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
                  aria-pressed={star <= rating}
                >
                  <FiStar />
                </button>
              ))}
            </div>
            <Button size="sm" type="submit" disabled={rating === 0}>
              Enviar calificacion
            </Button>
          </form>
        </div>
      )}

      {ticket.rating && (
        <div className={styles.ratedSection}>
          <h5>Calificacion enviada</h5>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar key={star} className={star <= ticket.rating ? styles.starActive : ''} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function TicketList({ tickets, onRate }) {
  const { t } = useTranslation('tenant');
  const { formatDate } = useFormatters();
  const [selectedId, setSelectedId] = useState(null);

  const selectedTicket = useMemo(() => {
    if (!tickets || tickets.length === 0) return null;
    return tickets.find((ticket) => ticket.id === selectedId) || tickets[0];
  }, [tickets, selectedId]);

  if (!tickets || tickets.length === 0) {
    return (
      <div className={styles.empty}>
        <FiClock className={styles.emptyIcon} />
        <p>{t('maintenance.empty', 'No tienes solicitudes de mantenimiento registradas.')}</p>
      </div>
    );
  }

  return (
    <div className={styles.workspace}>
      <aside className={styles.listPane}>
        <div className={styles.listPaneHeader}>
          <h4>Solicitudes</h4>
          <span>{tickets.length}</span>
        </div>

        <div className={styles.list}>
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              className={`${styles.ticketItem} ${selectedTicket?.id === ticket.id ? styles.active : ''}`}
              onClick={() => setSelectedId(ticket.id)}
            >
              <div className={styles.ticketTitleRow}>
                <h5>{ticket.title}</h5>
                <Badge variant={STATUS_VARIANTS[ticket.status]}>{STATUS_LABELS[ticket.status] || ticket.status}</Badge>
              </div>
              <p className={styles.ticketMeta}><FiCalendar /> {formatDate(ticket.createdAt)}</p>
              <div className={styles.badges}>
                <Badge variant={PRIORITY_VARIANTS[ticket.priority]}>{PRIORITY_LABELS[ticket.priority] || ticket.priority}</Badge>
                {ticket.category && <span className={styles.category}>{ticket.category}</span>}
              </div>
            </button>
          ))}
        </div>
      </aside>

      {selectedTicket && <TicketDetails key={selectedTicket.id} ticket={selectedTicket} onRate={onRate} />}
    </div>
  );
}
