import { useState, useEffect } from 'react';
import { FiSend, FiUser } from 'react-icons/fi';
import { useConversations, useMessages, useSendMessage, useMarkAsRead } from '../../hooks/useMessagesData';
import { formatTime } from '../../utils/formatters';
import Button from '../../components/common/Button/Button';
import styles from './OwnerMessagesPage.module.scss';

function InboxList({ conversations, activeId, onSelect }) {
  return (
    <div className={styles.inbox}>
      <div className={styles.inbox__header}>Conversaciones</div>
      <div className={styles.inbox__list}>
        {conversations.length === 0 ? (
          <div className={styles.inbox__empty}>No hay conversaciones</div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              type="button"
              className={`${styles.inbox__item} ${conv.id === activeId ? styles['inbox__item--active'] : ''}`}
              onClick={() => onSelect(conv)}
            >
              <div className={styles.inbox__avatar}>
                {conv.avatar || <FiUser />}
              </div>
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
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function ConversationPanel({ conversation }) {
  const [message, setMessage] = useState('');
  const { data: response } = useMessages(conversation?.id);
  const messages = response?.data || [];
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !conversation) return;
    await sendMessage.mutateAsync({
      receiverId: conversation.id,
      content: message.trim()
    });
    setMessage('');
  };

  useEffect(() => {
    if (conversation?.id && messages.some(m => !m.ownMessage)) {
      markAsRead.mutate(conversation.id);
    }
  }, [conversation?.id]);

  if (!conversation) {
    return (
      <div className={styles.conversation}>
        <div className={styles.conversation__empty}>
          Selecciona una conversación para comenzar a chatear
        </div>
      </div>
    );
  }

  return (
    <div className={styles.conversation}>
      <div className={styles.conversation__header}>
        <div className={styles.conversation__headerInfo}>
          <div className={styles.inbox__avatar}>
            {conversation.avatar || <FiUser />}
          </div>
          <span className={styles.conversation__headerName}>{conversation.contactName}</span>
        </div>
      </div>

      <div className={styles.conversation__messages}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.conversation__bubble} ${
              msg.ownMessage
                ? styles['conversation__bubble--own']
                : styles['conversation__bubble--other']
            }`}
          >
            <div className={styles.conversation__bubbleText}>{msg.text}</div>
            <div className={styles.conversation__bubbleTime}>
              {formatTime(msg.timestamp)}
            </div>
          </div>
        ))}
      </div>

      <form className={styles.conversation__inputArea} onSubmit={handleSend}>
        <input
          type="text"
          className={styles.conversation__input}
          placeholder="Escribe un mensaje..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sendMessage.isPending}
        />
        <Button
          variant="primary"
          size="md"
          type="submit"
          disabled={!message.trim() || sendMessage.isPending}
        >
          <FiSend />
        </Button>
      </form>
    </div>
  );
}

export default function OwnerMessagesPage() {
  const { data: response, isLoading } = useConversations();
  const conversations = response?.data || [];
  const [activeConversation, setActiveConversation] = useState(null);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.page__loading}>Cargando mensajes...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.page__header}>
        <h1 className={styles.page__title}>Mensajes</h1>
        <p className={styles.page__subtitle}>Comunicación con tu agente</p>
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