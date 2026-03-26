import { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { useConversations, useMessages } from '../../hooks/useMessagesData';
import { formatTime } from '../../utils/formatters';
import Button from '../../components/common/Button/Button';
import styles from './MessagesPage.module.scss';

function InboxList({ conversations, activeId, onSelect }) {
  return (
    <div className={styles.inbox}>
      <div className={styles.inbox__header}>Conversaciones</div>
      <div className={styles.inbox__list}>
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`${styles.inbox__item} ${conv.id === activeId ? styles['inbox__item--active'] : ''}`}
            onClick={() => onSelect(conv)}
          >
            <div className={styles.inbox__avatar}>{conv.avatar}</div>
            <div className={styles.inbox__info}>
              <p className={styles.inbox__name}>{conv.contactName}</p>
              <p className={styles.inbox__preview}>{conv.lastMessage}</p>
            </div>
            <div className={styles.inbox__meta}>
              <span className={styles.inbox__time}>{formatTime(conv.timestamp)}</span>
              {conv.unread > 0 && (
                <span className={styles.inbox__unread}>{conv.unread}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConversationPanel({ conversation }) {
  const { data: response } = useMessages(conversation?.id);
  const messages = response?.data || [];

  if (!conversation) {
    return (
      <div className={styles.conversation}>
        <div className={styles.conversation__empty}>
          Selecciona una conversación para comenzar
        </div>
      </div>
    );
  }

  return (
    <div className={styles.conversation}>
      <div className={styles.conversation__header}>
        <div className={styles.conversation__headerInfo}>
          <div className={styles.inbox__avatar}>{conversation.avatar}</div>
          <span className={styles.conversation__headerName}>{conversation.contactName}</span>
        </div>
      </div>

      <div className={styles.conversation__messages}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.conversation__bubble} ${
              msg.sender === 'agent'
                ? styles['conversation__bubble--agent']
                : styles['conversation__bubble--client']
            }`}
          >
            {msg.text}
            <div className={styles.conversation__bubbleTime}>
              {formatTime(msg.timestamp)}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.conversation__inputArea}>
        <input
          type="text"
          className={styles.conversation__input}
          placeholder="Escribe un mensaje..."
        />
        <Button variant="primary" size="sm">
          <FiSend />
        </Button>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const { data: response, isLoading } = useConversations();
  const conversations = response?.data || [];
  const [activeConversation, setActiveConversation] = useState(null);

  if (isLoading) return <p>Cargando mensajes...</p>;

  return (
    <div className={styles.page}>
      <div className={styles.page__header}>
        <div>
          <h1 className={styles.page__title}>Mensajes</h1>
          <p className={styles.page__subtitle}>Centro de comunicación</p>
        </div>
      </div>

      <div className={styles.page__body}>
        <InboxList
          conversations={conversations}
          activeId={activeConversation?.id}
          onSelect={setActiveConversation}
        />
        <ConversationPanel conversation={activeConversation} />
      </div>
    </div>
  );
}
