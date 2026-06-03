import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { MARITAL_STATUS_LABELS, FIGMA_COLORS } from '../../constants/clientConstants';

import { IoPersonOutline, IoSearchOutline, IoBedOutline, IoWaterOutline, IoWalletOutline, IoMapOutline, IoPricetagOutline, IoHomeOutline } from "react-icons/io5";

const ProfileDetails = ({ client }) => {
  if (!client) return null;

  const personalInfo = [
    { label: 'Nombre', value: client.userName?.split(' ')[0] || '-' },
    { label: 'Apellido', value: client.userName?.split(' ').slice(1).join(' ') || '-' },
    { label: 'Ocupación', value: client.occupation || 'N/A' },
    { label: 'Estado Civil', value: MARITAL_STATUS_LABELS[client.maritalStatus] || client.maritalStatus || '-' },
    { label: 'Ingresos', value: client.annualIncome ? `$${(client.annualIncome / 1000).toFixed(0)}k/año` : 'N/A' },
    { label: 'Origen', value: client.sourceChannel || 'Directo' },
  ];

  const tagStyle = (color) => ({
    backgroundColor: `rgba(${color}, 0.1)`,
    color: `rgb(${color})`,
    fontWeight: '600',
    fontSize: '0.75rem',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '8px',
    letterSpacing: '0.01em'
  });

  const colorMap = {
    green: '16, 185, 129',
    purple: '139, 92, 246',
    pink: '236, 72, 153',
    blue: '37, 99, 235'
  };

  return (
    <Card className="border-0 shadow-sm" style={{ borderRadius: '24px', overflow: 'hidden', animation: 'fadeInUp 0.8s var(--ease-out) 0.2s both' }}>
      <Card.Body className="p-4 p-md-5">
        <Row className="g-5">
          {/* Información Personal */}
          <Col lg={6}>
            <div className="d-flex align-items-center gap-3 mb-4">
                <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' }}>
                    <IoPersonOutline size={22} />
                </div>
                <h4 className="fw-bold mb-0" style={{ color: '#0f172a', fontSize: '1.25rem' }}>Información Personal</h4>
            </div>
            <Row className="g-4">
              {personalInfo.map((info, idx) => (
                <Col key={idx} xs={6}>
                  <div className="fw-bold mb-1" style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{info.label}</div>
                  <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '500' }}>{info.value}</div>
                </Col>
              ))}
            </Row>
          </Col>

          {/* Preferencias de Búsqueda */}
          <Col lg={6}>
            <div className="d-flex align-items-center gap-3 mb-4">
                <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <IoSearchOutline size={22} />
                </div>
                <h4 className="fw-bold mb-0" style={{ color: '#0f172a', fontSize: '1.25rem' }}>Preferencias de Búsqueda</h4>
            </div>
            
            <Row className="g-4 mb-4">
              <Col xs={12}>
                <div className="d-flex align-items-center gap-2 mb-2">
                    <IoWalletOutline className="text-muted" />
                    <span className="fw-bold" style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Rango de Presupuesto</span>
                </div>
                <div style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>
                    {client.minBudget ? `$${client.minBudget.toLocaleString()}` : '—'} - {client.maxBudget ? `$${client.maxBudget.toLocaleString()}` : '—'}
                </div>
              </Col>
              <Col xs={6}>
                <div className="d-flex align-items-center gap-2 mb-2">
                    <IoBedOutline className="text-muted" />
                    <span className="fw-bold" style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Habitaciones</span>
                </div>
                <div style={{ color: '#0f172a', fontSize: '1rem', fontWeight: '600' }}>{client.minBedrooms ?? '-'} a {client.maxBedrooms ?? '-'}</div>
              </Col>
              <Col xs={6}>
                <div className="d-flex align-items-center gap-2 mb-2">
                    <IoWaterOutline className="text-muted" />
                    <span className="fw-bold" style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Baños</span>
                </div>
                <div style={{ color: '#0f172a', fontSize: '1rem', fontWeight: '600' }}>{client.minBathrooms ?? '-'} a {client.maxBathrooms ?? '-'}</div>
              </Col>
            </Row>

            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                  <IoHomeOutline className="text-muted" />
                  <span className="fw-bold" style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Tipos de propiedad</span>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {client.preferredPropertyTypes?.length > 0 ? (
                  client.preferredPropertyTypes.map((tag, i) => (
                    <Badge key={i} bg="none" style={tagStyle(colorMap.green)}>{tag}</Badge>
                  ))
                ) : <span className="text-muted small">No especificado</span>}
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                  <IoMapOutline className="text-muted" />
                  <span className="fw-bold" style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Áreas preferidas</span>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {client.preferredAreas?.length > 0 ? (
                  client.preferredAreas.map((tag, i) => (
                    <Badge key={i} bg="none" style={tagStyle(colorMap.purple)}>{tag}</Badge>
                  ))
                ) : <span className="text-muted small">No especificado</span>}
              </div>
            </div>

            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                  <IoPricetagOutline className="text-muted" />
                  <span className="fw-bold" style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Etiquetas</span>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {client.tags?.length > 0 ? (
                  client.tags.map((tag, i) => (
                    <Badge key={i} bg="none" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: '600', fontSize: '0.7rem' }}>{tag}</Badge>
                  ))
                ) : <span className="text-muted small">Sin etiquetas</span>}
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ProfileDetails;
