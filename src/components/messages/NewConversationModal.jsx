import { useState, useEffect } from 'react';
import { Modal, Form, ListGroup, Spinner, Button } from 'react-bootstrap';
import { useAgents, useClients, useContacts } from '../../hooks/useContacts';
import { useSendMessage } from '../../hooks/useMessagesData';
import styles from './NewConversationModal.module.scss';

export default function NewConversationModal({ isOpen, onClose, preSelectedAgent, onSuccess }) {
  const [step, setStep] = useState('select');
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [message, setMessage] = useState('');
  
  const { canSeeAgents, canSeeClients } = useContacts();
  const { data: agentsData, isLoading: agentsLoading } = useAgents(search);
  const { data: clientsData, isLoading: clientsLoading, refetch: refetchClients } = useClients();
  const sendMessage = useSendMessage();

  useEffect(() => {
    if (preSelectedAgent) {
      setSelectedContact(preSelectedAgent);
      setStep('compose');
    }
  }, [preSelectedAgent]);

  useEffect(() => {
    if (canSeeClients && isOpen) {
      refetchClients();
    }
  }, [canSeeClients, isOpen, refetchClients]);

  const agents = agentsData?.data?.content || agentsData || [];
  const clients = clientsData?.data?.content || clientsData || [];

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setStep('compose');
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedContact) return;
    
    await sendMessage.mutateAsync({
      receiverId: selectedContact.id,
      content: message.trim()
    });
    
    setMessage('');
    setSelectedContact(null);
    setStep('select');
    onSuccess?.();
    onClose();
  };

  const handleClose = () => {
    setStep('select');
    setSelectedContact(null);
    setMessage('');
    setSearch('');
    onClose();
  };

  const getContactName = (contact) => contact.name || contact.email || 'Sin nombre';
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
          <Modal.Title>Nuevo mensaje</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={styles.selectedContact}>
            <div className={styles.avatar}>
              {getContactInitials(selectedContact)}
            </div>
            <span className={styles.contactName}>{getContactName(selectedContact)}</span>
          </div>
          <Form.Group className="mt-3">
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Escribe tu mensaje..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setStep('select')}>
            Atrás
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSend}
            disabled={!message.trim() || sendMessage.isPending}
          >
            {sendMessage.isPending ? 'Enviando...' : 'Enviar'}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <Modal show={isOpen} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Nueva conversación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </Form.Group>

        {canSeeAgents && (
          <div className={styles.section}>
            <h6 className={styles.sectionTitle}>Agentes</h6>
            {agentsLoading ? (
              <div className={styles.loading}><Spinner size="sm" /> Cargando...</div>
            ) : agents.length === 0 ? (
              <div className={styles.empty}>No hay agentes disponibles</div>
            ) : (
              <ListGroup>
                {agents.map((agent) => (
                  <ListGroup.Item
                    key={agent.id}
                    action
                    onClick={() => handleSelectContact({ id: agent.userId, ...agent })}
                    className={styles.contactItem}
                  >
                    <div className={styles.avatar}>{getContactInitials(agent)}</div>
                    <div className={styles.info}>
                      <div className={styles.name}>{agent.name}</div>
                      <div className={styles.subtext}>{agent.company || 'Agente inmobiliario'}</div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
        )}

        {canSeeClients && (
          <div className={styles.section}>
            <h6 className={styles.sectionTitle}>Mis clientes</h6>
            {clientsLoading ? (
              <div className={styles.loading}><Spinner size="sm" /> Cargando...</div>
            ) : clients.length === 0 ? (
              <div className={styles.empty}>No hay clientes disponibles</div>
            ) : (
              <ListGroup>
                {clients.map((client) => (
                  <ListGroup.Item
                    key={client.id}
                    action
                    onClick={() => handleSelectContact({ id: client.userId || client.id, ...client })}
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