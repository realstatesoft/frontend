import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { MARITAL_STATUS_LABELS, FIGMA_COLORS } from '../../constants/clientConstants';

const ProfileDetails = ({ client }) => {
  if (!client) return null;

  const personalInfo = [
    { label: 'Nombre', value: client.userName?.split(' ')[0] || '-' },
    { label: 'Apellido', value: client.userName?.split(' ').slice(1).join(' ') || '-' },
    { label: 'Fecha de Nacimiento', value: client.birthDate || '-' },
    { label: 'Estado Civil', value: MARITAL_STATUS_LABELS[client.maritalStatus] || client.maritalStatus || '-' },
    { label: 'Ocupación', value: client.occupation || 'No especificada' },
    { label: 'Ingresos Anuales', value: `$ ${client.annualIncome?.toLocaleString() || '-'}` },
    { label: 'Dirección', value: client.address || '-' },
    { label: 'Canal de Origen', value: client.sourceChannel || '-' },
  ];

  const tagStyle = (bgColor, textColor) => ({
    backgroundColor: bgColor,
    color: textColor,
    fontWeight: '600',
    fontSize: '0.85rem',
    border: 'none'
  });

  return (
    <Card className="border-0 shadow-sm" style={{ borderRadius: '1.5rem' }}>
      <Card.Body className="p-4 p-md-5">
        <Row>
          {/* Información Personal */}
          <Col md={6} className="border-end pe-md-5">
            <h4 className="fw-bold mb-4" style={{ color: FIGMA_COLORS.deepDark }}>Información Personal</h4>
            <Row className="g-4">
              {personalInfo.map((info, idx) => (
                <Col key={idx} xs={6}>
                  <div className="fw-bold mb-1" style={{ fontSize: '0.9rem', color: FIGMA_COLORS.deepDark }}>{info.label}</div>
                  <div className="text-muted" style={{ fontSize: '0.9rem' }}>{info.value}</div>
                </Col>
              ))}
            </Row>
          </Col>

          {/* Preferencias de Búsqueda */}
          <Col md={6} className="ps-md-5">
            <h4 className="fw-bold mb-4" style={{ color: FIGMA_COLORS.deepDark }}>Preferencias de Búsqueda</h4>
            
            <div className="mb-4">
              <div className="fw-bold mb-1" style={{ fontSize: '0.9rem', color: FIGMA_COLORS.deepDark }}>Rango de Presupuesto</div>
              <div style={{ color: FIGMA_COLORS.deepDark, fontSize: '1rem', fontWeight: '400' }}>
                $ {client.minBudget?.toLocaleString()} - $ {client.maxBudget?.toLocaleString()}
              </div>
            </div>

            <Row className="mb-4">
              <Col xs={6}>
                <div className="fw-bold mb-1" style={{ fontSize: '0.9rem', color: FIGMA_COLORS.deepDark }}>Habitaciones</div>
                <div style={{ color: FIGMA_COLORS.deepDark, fontSize: '1rem', fontWeight: '400' }}>
                  {client.minBedrooms} - {client.maxBedrooms}
                </div>
              </Col>
              <Col xs={6}>
                <div className="fw-bold mb-1" style={{ fontSize: '0.9rem', color: FIGMA_COLORS.deepDark }}>Baños</div>
                <div style={{ color: FIGMA_COLORS.deepDark, fontSize: '1rem', fontWeight: '400' }}>
                  {client.minBathrooms} - {client.maxBathrooms}
                </div>
              </Col>
            </Row>

            <div className="mb-4">
              <div className="fw-bold mb-2" style={{ fontSize: '0.9rem', color: FIGMA_COLORS.deepDark }}>Tipos de propiedad</div>
              <div className="d-flex flex-wrap gap-2">
                {client.preferredPropertyTypes?.map((tag, i) => (
                  <Badge key={i} bg="none" style={tagStyle(FIGMA_COLORS.paleGreenBg, FIGMA_COLORS.paleGreenText)} className="px-3 py-2 rounded-pill">{tag}</Badge>
                )) || <span className="text-muted">-</span>}
              </div>
            </div>

            <div className="mb-4">
              <div className="fw-bold mb-2" style={{ fontSize: '0.9rem', color: FIGMA_COLORS.deepDark }}>Áreas preferidas</div>
              <div className="d-flex flex-wrap gap-2">
                {client.preferredAreas?.map((tag, i) => (
                  <Badge key={i} bg="none" style={tagStyle(FIGMA_COLORS.palePurpleBg, FIGMA_COLORS.palePurpleText)} className="px-3 py-2 rounded-pill">{tag}</Badge>
                )) || <span className="text-muted">-</span>}
              </div>
            </div>

            <div className="mb-4">
              <div className="fw-bold mb-2" style={{ fontSize: '0.9rem', color: FIGMA_COLORS.deepDark }}>Características deseadas</div>
              <div className="d-flex flex-wrap gap-2">
                {client.desiredFeatures?.map((tag, i) => (
                  <Badge key={i} bg="none" style={tagStyle(FIGMA_COLORS.palePinkBg, FIGMA_COLORS.palePinkText)} className="px-3 py-2 rounded-pill">{tag}</Badge>
                )) || <span className="text-muted">-</span>}
              </div>
            </div>

            <div>
              <div className="fw-bold mb-2" style={{ fontSize: '0.9rem', color: FIGMA_COLORS.deepDark }}>Etiquetas</div>
              <div className="d-flex flex-wrap gap-2">
                {client.tags?.map((tag, i) => (
                  <Badge key={i} bg="none" style={{ backgroundColor: '#F5F5F5', color: '#616161', fontWeight: '500' }} className="px-3 py-2 rounded-pill border fw-normal">{tag}</Badge>
                )) || <span className="text-muted">-</span>}
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ProfileDetails;
