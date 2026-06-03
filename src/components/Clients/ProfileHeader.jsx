import React from 'react';
import { Card, Row, Col, Badge, Button, Stack, Dropdown, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  EnvelopeFill,
  TelephoneFill,
  BriefcaseFill,
  ChevronDown,
  PencilSquare
} from 'react-bootstrap-icons';
import { FiMessageSquare } from 'react-icons/fi';
import Swal from 'sweetalert2';
import NewConversationModal from '../messages/NewConversationModal';
import clientApi from '../../services/clients/clientApi';
import {
  CLIENT_PRIORITY_LABELS,
  CLIENT_STATUS_LABELS,
  FIGMA_COLORS
} from '../../constants/clientConstants';

const ProfileHeader = ({ client, onClientUpdate }) => {
  const navigate = useNavigate();
  const [showMessageModal, setShowMessageModal] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleUpdate = async (field, value) => {
    if (client[field] === value) return;
    setIsUpdating(true);
    try {
      if (client.isExternal) {
        await clientApi.updateExternalClientProfile(client.id, { [field]: value });
      } else {
        await clientApi.updateClientProfile(client.id, { [field]: value });
      }
      if (onClientUpdate) {
        await onClientUpdate({ silent: true });
      }
      Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: 'Se han guardado los cambios.',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al actualizar el cliente.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const preSelectedAgent = React.useMemo(() => {
    if (!client) return null;
    return {
      id: client.userId || client.id,
      name: client.userName,
      email: client.userEmail,
    };
  }, [client?.userId, client?.id, client.userName, client.userEmail]);

  if (!client) return null;

  const priorityLabel = CLIENT_PRIORITY_LABELS[client.priority] || client.priority;
  const statusLabel = CLIENT_STATUS_LABELS[client.status] || client.status;

  const buttonActionStyle = {
    borderRadius: '999px',
    padding: '0.6rem 1.2rem',
    border: '1px solid #e2e8f0',
    backgroundColor: '#fff',
    color: '#0f172a',
    fontWeight: '600',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.2s cubic-bezier(0.23, 1, 0.32, 1)',
    cursor: 'pointer'
  };

  const dropdownMenuStyle = {
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    padding: '0.5rem',
    minWidth: '180px',
    animation: 'dropdownFadeIn 0.2s var(--ease-out)',
    zIndex: 1050
  };

  const dropdownItemStyle = {
    borderRadius: '10px',
    padding: '0.6rem 1rem',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#475569',
    transition: 'all 0.15s ease',
    marginBottom: '2px'
  };

  return (
    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '24px', animation: 'fadeInDown 0.8s var(--ease-out) both' }}>
      <style>
        {`
          @keyframes dropdownFadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .custom-dropdown-item:hover {
            background-color: #f1f5f9 !important;
            color: #2563eb !important;
          }
          .custom-dropdown-item.active {
            background-color: #2563eb !important;
            color: white !important;
          }
          /* Ajuste para evitar parpadeos de Popper.js */
          .dropdown-menu[data-popper-placement] {
            margin: 0 !important;
          }
          /* Ocultar flecha por defecto de Bootstrap para evitar duplicidad */
          .dropdown-toggle::after {
            display: none !important;
          }
        `}
      </style>
      <Card.Body className="p-4">
        <Row className="align-items-center g-4">
          {/* Avatar Area */}
          <Col xs="auto">
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)',
                transition: 'transform 0.2s ease'
              }}
            >
              <svg viewBox="0 0 24 24" fill="white" style={{ width: '60%', height: '60%' }}>
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </Col>

          {/* Info Area */}
          <Col>
            <div className="d-flex align-items-center gap-3 mb-2">
              <h1 className="fw-bold mb-0" style={{ color: '#0f172a', fontSize: '2rem', letterSpacing: '-0.02em' }}>
                {client.userName}
              </h1>
              {client.isExternal && (
                <Badge bg="primary" className="rounded-pill px-2 py-1" style={{ fontSize: '0.65rem', fontWeight: '800' }}>EXTERNO</Badge>
              )}
            </div>

            <div className="d-flex gap-3 mb-3">
              <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                {statusLabel}
              </div>
              <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
                Prioridad: {priorityLabel}
              </div>
            </div>

            <div className="text-muted d-flex flex-wrap gap-3 small fw-medium">
              <span className="d-flex align-items-center gap-1"><EnvelopeFill className="opacity-50" /> {client.userEmail}</span>
              <span className="d-flex align-items-center gap-1"><TelephoneFill className="opacity-50" /> {client.userPhone || 'N/A'}</span>
              <span className="d-flex align-items-center gap-1"><BriefcaseFill className="opacity-50" /> {client.occupation || 'N/A'}</span>
            </div>
          </Col>

          {/* Actions Area */}
          <Col lg="auto">
            <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                <Dropdown>
                  <Dropdown.Toggle 
                    as="button"
                    style={buttonActionStyle} 
                    className="btn shadow-sm"
                    disabled={isUpdating}
                  >
                      {isUpdating ? <Spinner size="sm" animation="border" /> : statusLabel} <ChevronDown size={12} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu 
                    style={dropdownMenuStyle}
                    popperConfig={{
                      modifiers: [
                        {
                          name: 'offset',
                          options: {
                            offset: [0, 8],
                          },
                        },
                      ],
                    }}
                  >
                    {Object.entries(CLIENT_STATUS_LABELS).map(([val, label]) => (
                      <Dropdown.Item 
                        key={val} 
                        onClick={() => handleUpdate('status', val)} 
                        active={client.status === val}
                        style={dropdownItemStyle}
                        className="custom-dropdown-item"
                      >
                        {label}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown>
                  <Dropdown.Toggle 
                    as="button"
                    style={buttonActionStyle} 
                    className="btn shadow-sm"
                    disabled={isUpdating}
                  >
                      {isUpdating ? <Spinner size="sm" animation="border" /> : priorityLabel} <ChevronDown size={12} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu 
                    style={dropdownMenuStyle}
                    popperConfig={{
                      modifiers: [
                        {
                          name: 'offset',
                          options: {
                            offset: [0, 8],
                          },
                        },
                      ],
                    }}
                  >
                    {Object.entries(CLIENT_PRIORITY_LABELS).map(([val, label]) => (
                      <Dropdown.Item 
                        key={val} 
                        onClick={() => handleUpdate('priority', val)} 
                        active={client.priority === val}
                        style={dropdownItemStyle}
                        className="custom-dropdown-item"
                      >
                        {label}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
                <Button
                    variant="outline-primary"
                    className="rounded-pill px-4 fw-bold border-2 d-flex align-items-center gap-2"
                    style={{ transition: 'all 0.2s ease' }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onClick={() => setShowMessageModal(true)}
                >
                    <FiMessageSquare /> Mensaje
                </Button>
                <Button
                    variant="primary"
                    className="rounded-pill px-4 fw-bold border-0 shadow-md d-flex align-items-center gap-2"
                    style={{ background: '#2563eb', transition: 'all 0.2s ease' }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onClick={() => navigate(`/clientes/${client.id}/editar`)}
                >
                    <PencilSquare style={{ fontSize: '0.9rem' }} /> Editar Perfil
                </Button>
            </div>
          </Col>
        </Row>
      </Card.Body>

      <NewConversationModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        preSelectedAgent={preSelectedAgent}
        onSuccess={() => {
          Swal.fire({
            icon: 'success',
            title: '¡Mensaje enviado!',
            text: 'Tu mensaje ha sido enviado correctamente.',
            timer: 2000,
            showConfirmButton: false,
          });
        }}
      />
    </Card>
  );
};

export default ProfileHeader;
