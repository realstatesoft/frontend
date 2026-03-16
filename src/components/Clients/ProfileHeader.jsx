import React from 'react';
import { Card, Row, Col, Badge, Button, Stack } from 'react-bootstrap';
import { 
  EnvelopeFill, 
  TelephoneFill, 
  BriefcaseFill, 
  ChevronDown, 
  SendFill 
} from 'react-bootstrap-icons';
import { 
  CLIENT_PRIORITY_LABELS, 
  CLIENT_STATUS_LABELS, 
  FIGMA_COLORS 
} from '../../constants/clientConstants';

const ProfileHeader = ({ client }) => {
  if (!client) return null;

  const priorityLabel = CLIENT_PRIORITY_LABELS[client.priority] || client.priority;
  const statusLabel = CLIENT_STATUS_LABELS[client.status] || client.status;

  const buttonActionStyle = {
    borderRadius: '2rem',
    padding: '0.5rem 1.5rem',
    border: '1px solid #dee2e6',
    backgroundColor: '#fff',
    color: '#212529',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: '140px',
    boxShadow: 'none'
  };

  return (
    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
      <Card.Body className="p-4 p-md-5">
        <Row className="align-items-center">
          <Col xs="auto">
            {/* Avatar - Silueta Default */}
            <div 
              style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                backgroundColor: FIGMA_COLORS.deepDark,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              <svg 
                viewBox="0 0 24 24" 
                fill="white" 
                style={{ width: '80%', height: '80%', marginTop: 'auto' }}
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </Col>
          <Col>
            <Stack direction="horizontal" gap={3} className="align-items-baseline mb-2">
              <h1 className="fw-bold mb-0" style={{ color: FIGMA_COLORS.deepDark }}>{client.userName}</h1>
              {client.isExternal && (
                <Badge 
                  bg="none" 
                  style={{ 
                    backgroundColor: FIGMA_COLORS.paleBlueBg, 
                    color: FIGMA_COLORS.paleBlueText, 
                    fontWeight: '600',
                    fontSize: '0.85rem'
                  }} 
                  className="px-3 py-2 rounded-pill border-0"
                >
                  Externo
                </Badge>
              )}
            </Stack>
            
            <Stack direction="horizontal" gap={2} className="mb-4">
              <Badge 
                bg="none" 
                style={{ backgroundColor: FIGMA_COLORS.paleGreenBg, color: FIGMA_COLORS.paleGreenText }} 
                className="px-3 py-2 rounded-pill border-0 fw-bold"
              >
                {statusLabel}
              </Badge>
              <Badge 
                bg="none" 
                style={{ backgroundColor: FIGMA_COLORS.paleRedBg, color: FIGMA_COLORS.paleRedText }} 
                className="px-3 py-2 rounded-pill border-0 fw-bold"
              >
                Prioridad: {priorityLabel}
              </Badge>
            </Stack>

            <div className="text-muted d-flex flex-wrap gap-4" style={{ fontSize: '0.9rem' }}>
              <span className="d-flex align-items-center">
                <EnvelopeFill className="me-2" style={{ color: FIGMA_COLORS.deepDark, opacity: 0.7 }} />
                {client.userEmail}
              </span>
              <span className="d-flex align-items-center">
                <TelephoneFill className="me-2" style={{ color: FIGMA_COLORS.deepDark, opacity: 0.7 }} />
                {client.phone || '+595 985 873142'}
              </span>
              <span className="d-flex align-items-center">
                <BriefcaseFill className="me-2" style={{ color: FIGMA_COLORS.deepDark, opacity: 0.7 }} />
                {client.occupation || 'No especificada'}
              </span>
            </div>
          </Col>
          <Col xs="auto" className="d-flex gap-3 align-self-start mt-3 mt-md-0">
             <button style={buttonActionStyle} className="btn shadow-none">
               Activo <ChevronDown className="ms-2" size={14} />
             </button>
             <button style={buttonActionStyle} className="btn shadow-none">
               Alta Prioridad <ChevronDown className="ms-2" size={14} />
             </button>
             <Button 
                variant="primary" 
                className="rounded-pill px-4 d-flex align-items-center border-0"
                style={{ backgroundColor: '#0D6EFD' }}
             >
               <SendFill className="me-2" style={{ transform: 'rotate(45deg)', fontSize: '0.8rem' }} />
               Editar
             </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ProfileHeader;
