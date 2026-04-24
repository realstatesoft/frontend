import { useState, useEffect } from 'react';
import { FiSend, FiUser, FiPlus, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useConversations, useMessages, useSendMessage, useMarkAsRead } from '../../hooks/useMessagesData';
import { formatTime } from '../../utils/formatters';
import Button from '../../components/common/Button/Button';
import NewConversationModal from '../../components/messages/NewConversationModal';
import CustomNavbar from '../../components/Landing/Navbar';
import styles from './ClientMessagesPage.module.scss';

function InboxList({ conversations, activeId, onSelect }) {
  const { t } = useTranslation('owner');
  return (
    <div className={styles.inbox}>
      <div className={styles.inbox__header}>{t('messages.inbox')}</div>
      <div className={styles.inbox__list}>
        {conversations.length === 0 ? (
          <div className={styles.inbox__empty}>{t('messages.emptyInbox')}</div>
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
                <p className={styles.inbox__preview}>
                {conv.lastMessageOwn ? `Tú: ${conv.lastMessage}` : conv.lastMessage}
              </p>
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
  const { t } = useTranslation('owner');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !conversation) return;
    await sendMessage.mutateAsync({
      receiverId: conversation.userId || conversation.recipientId || conversation.id,
      content: message.trim()
    });
    setMessage('');
  };

  useEffect(() => {
    if (conversation?.id && messages?.length > 0 && messages.some(m => !m.ownMessage)) {
      markAsRead.mutate(conversation.id);
    }
  }, [conversation?.id, messages]);

  if (!conversation) {
    return (
      <div className={styles.conversation}>
        <div className={styles.conversation__empty}>
          {t('messages.emptyConversation')}
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
          placeholder={t('messages.placeholder')}
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

export default function ClientMessagesPage() {
  const { data: response, isLoading, refetch } = useConversations();
  const conversations = response?.data || [];
  const [activeConversation, setActiveConversation] = useState(null);
  const [showNewConvModal, setShowNewConvModal] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('owner');

  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <CustomNavbar />
        <div className={styles.page}>
          <div className={styles.page__loading}>{t('messages.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <CustomNavbar />
      <div className={styles.page}>
        <div className={styles.page__header}>
          <button
            type="button"
            className={styles.page__back}
            onClick={() => navigate(-1)}
            aria-label={t('back', { ns: 'common' })}
          >
            <FiArrowLeft size={18} />
          </button>
          <div className={styles.page__headerText}>
            <h1 className={styles.page__title}>{t('messages.title')}</h1>
            <p className={styles.page__subtitle}>{t('messages.subtitle')}</p>
          </div>
          {/*<Button
            variant="outline-primary"
            size="sm"
            onClick={() => setShowNewConvModal(true)}
          >
            <FiPlus className="me-1" /> Nueva conversación
          </Button>*/}
        </div>

        <div className={styles.page__body}>
          <InboxList
            conversations={conversations}
            activeId={activeConversation?.id}
            onSelect={setActiveConversation}
          />
          <ConversationPanel conversation={activeConversation} />
        </div>

        <NewConversationModal
          isOpen={showNewConvModal}
          onClose={() => setShowNewConvModal(false)}
          onSuccess={() => refetch()}
        />
      </div>
    </div>
  );
}
