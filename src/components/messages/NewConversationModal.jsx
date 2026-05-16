import { useState, useEffect } from 'react';
import { Modal, Form, ListGroup, Spinner, Button } from 'react-bootstrap';
import { useAgents, useClients, useContacts } from '../../hooks/useContacts';
import { useSendMessage } from '../../hooks/useMessagesData';
import styles from './NewConversationModal.module.scss';
import { useTranslation } from 'react-i18next';
import { useFormValidation } from '../../hooks/useFormValidation';

export default function NewConversationModal({ isOpen, onClose, preSelectedAgent, onSuccess }) {
  const { t } = useTranslation('messages');
  const [step, setStep] = useState('select');
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { fieldErrors, validate, clearFieldError, clearAllErrors } = useFormValidation();
  
  const { canSeeAgents, canSeeClients } = useContacts();
  const { data: agentsData, isLoading: agentsLoading, error: agentsError } = useAgents(search);
  const { data: clientsData, isLoading: clientsLoading, error: clientsError, refetch: refetchClients } = useClients();
  const sendMessage = useSendMessage();

  useEffect(() => {
    if (isOpen && preSelectedAgent) {
      setSelectedContact(preSelectedAgent);
      setStep('compose');
    }
  }, [isOpen, preSelectedAgent]);

  useEffect(() => {
    if (canSeeClients && isOpen) {
      refetchClients();
    }
  }, [canSeeClients, isOpen, refetchClients]);

  const agents = Array.isArray(agentsData?.content) 
    ? agentsData.content 
    : (Array.isArray(agentsData) ? agentsData : []);

  const clients = Array.isArray(clientsData?.content) 
    ? clientsData.content 
    : (Array.isArray(clientsData) ? clientsData : []);

  const handleSelectContact = (contact) => {
    if (!contact?.id) {
      setError(t('newConversation.invalidContact'));
      return;
    }
    setError('');
    setSelectedContact(contact);
    setStep('compose');
  };

  const handleSend = async () => {
    const valid = validate({
      message: { value: message, label: "Mensaje", required: true },
    });
    if (!valid || !selectedContact) return;
    
    setError('');
    try {
      await sendMessage.mutateAsync({
        receiverId: selectedContact.userId || selectedContact.id,
        content: message.trim()
      });
      
      setMessage('');
      setSelectedContact(null);
      setStep('select');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || t('newConversation.error'));
    }
  };

  const handleClose = () => {
    setStep('select');
    setSelectedContact(null);
    setMessage('');
    setSearch('');
    setError('');
    clearAllErrors();
    onClose();
  };

  const getContactName = (contact) => contact.name || contact.email || t('newConversation.contactFallback');
  const getContactInitials = (contact) => {
    const name = contact.name || contact.email || '??';
    const parts = name.trim().split(' ');
    return parts.length >= 2 
      ? (parts[0][0] + parts[1][0]).toUpperCase() 
      : name.substring(0, 2).toUpperCase();
  };

  if (step === 'compose') {
    return (
      <Modal show={isOpen} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('newConversation.composeTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={styles.selectedContact}>
            <div className={styles.avatar}>
              {getContactInitials(selectedContact)}
            </div>
            <span className={styles.contactName}>{getContactName(selectedContact)}</span>
          </div>
          {error && (
            <div className="alert alert-danger mb-3" role="alert">
              {error}
            </div>
          )}
          <Form.Group className="mt-3">
            <Form.Control
              as="textarea"
              rows={4}
              placeholder={t('newConversation.messagePlaceholder')}
              value={message}
              onChange={(e) => { setMessage(e.target.value); clearFieldError('message'); }}
              className={fieldErrors.message ? 'field-error' : ''}
            />
            {fieldErrors.message && <div className="field-error-msg">{fieldErrors.message}</div>}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setStep('select')}>
            {t('newConversation.back')}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSend}
            disabled={!message.trim() || sendMessage.isPending}
          >
            {sendMessage.isPending ? t('newConversation.sending') : t('newConversation.send')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <Modal show={isOpen} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{t('newConversation.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder={t('newConversation.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </Form.Group>

        {canSeeAgents && (
          <div className={styles.section}>
            <h6 className={styles.sectionTitle}>{t('newConversation.agents')}</h6>
            {agentsLoading ? (
              <div className={styles.loading}><Spinner size="sm" /> Cargando...</div>
            ) : agentsError ? (
              <div className={styles.error}>Error cargando agentes</div>
            ) : agents.length === 0 ? (
              <div className={styles.empty}>{t('newConversation.emptyAgents')}</div>
            ) : (
              <ListGroup>
                {agents.map((agent) => (
                  <ListGroup.Item
                    key={agent.id}
                    action
                    onClick={() => handleSelectContact({ ...agent, id: agent.userId || agent.id })}
                    className={styles.contactItem}
                  >
                    <div className={styles.avatar}>{getContactInitials(agent)}</div>
                    <div className={styles.info}>
                      <div className={styles.name}>{agent.name}</div>
                      <div className={styles.subtext}>{agent.company || t('newConversation.agentFallback')}</div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
        )}

        {canSeeClients && (
          <div className={styles.section}>
            <h6 className={styles.sectionTitle}>{t('newConversation.clients')}</h6>
            {clientsLoading ? (
              <div className={styles.loading}><Spinner size="sm" /> {t('newConversation.loading')}</div>
            ) : clientsError ? (
              <div className={styles.error}>Error cargando clientes</div>
            ) : clients.length === 0 ? (
              <div className={styles.empty}>{t('newConversation.emptyClients')}</div>
            ) : (
              <ListGroup>
                {clients.map((client) => (
                  <ListGroup.Item
                    key={client.id}
                    action
                    onClick={() => handleSelectContact({ ...client, id: client.userId || client.id })}
                    className={styles.contactItem}
                  >
                    <div className={styles.avatar}>{getContactInitials(client)}</div>
                    <div className={styles.info}>
                      <div className={styles.name}>{client.name || client.email}</div>
                      <div className={styles.subtext}>{client.email}</div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}
