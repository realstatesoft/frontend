import useOwnerMessages from '../../hooks/useOwnerMessages';
import styles from './OwnerMessagesPage.module.scss';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function OwnerMessagesPage() {
  const { data: response } = useOwnerMessages();
  const messages = response?.data || [];

  return (
    <div className={styles.messages}>
      <div className={styles.messages__header}>
        <div>
          <h1 className={styles.messages__title}>Mensajes</h1>
          <p className={styles.messages__subtitle}>
            Consultas e interacciones con interesados
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className={styles.messages__empty}>No hay mensajes</div>
      ) : (
        <div className={styles.messages__list}>
          {messages.map((msg) => {
            const itemClass = [
              styles.messages__item,
              !msg.read && styles['messages__item--unread'],
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <div key={msg.id} className={itemClass}>
                <div className={styles.messages__itemAvatar}>
                  {getInitials(msg.senderName)}
                </div>
                <div className={styles.messages__itemContent}>
                  <div className={styles.messages__itemSender}>
                    {msg.senderName}
                  </div>
                  <div className={styles.messages__itemSubject}>
                    {msg.subject}
                  </div>
                  <div className={styles.messages__itemPreview}>
                    {msg.preview}
                  </div>
                </div>
                <span className={styles.messages__itemDate}>
                  {formatDate(msg.date)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
