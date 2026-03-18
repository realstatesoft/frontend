import React from 'react';
import { Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { PersonCircle, Envelope, Phone, Clock, Check2Circle, XCircle, Calendar3, ArrowRepeat } from 'react-bootstrap-icons';
import './visits.scss';

const VisitCard = ({ visit, onConfirm, onSuggest, onReject, disabled }) => {

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge bg="warning" text="dark" className="visit-status-badge">Pendiente</Badge>;
      case 'ACCEPTED':
        return <Badge bg="success" className="visit-status-badge">Aceptada</Badge>;
      case 'REJECTED':
        return <Badge bg="danger" className="visit-status-badge">Rechazada</Badge>;
      case 'COUNTER_PROPOSED':
        return <Badge bg="info" className="visit-status-badge">Contra-propuesta</Badge>;
      case 'CANCELLED':
        return <Badge bg="secondary" className="visit-status-badge">Cancelada</Badge>;
      default:
        return null;
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const dateStr = date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dateStr} - ${timeStr} hs`;
  };

  const formatReceivedDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isPending = visit.status === 'PENDING' || visit.status === 'COUNTER_PROPOSED';

  return (
    <Card className="visit-card mb-4 border-0 overflow-hidden">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <Card.Title className="h5 fw-bold mb-1">{visit.propertyTitle}</Card.Title>
            <Card.Text className="text-muted small">
              Propiedad #{visit.propertyId}
            </Card.Text>
          </div>
          {getStatusBadge(visit.status)}
        </div>

        <div className="mb-4">
          <span className="fw-bold d-block mb-1">
            <Calendar3 className="me-2 text-primary" />
            {formatDateTime(visit.proposedAt)}
          </span>
          {visit.counterProposedAt && (
            <span className="d-block mt-1 small text-info">
              <ArrowRepeat className="me-2" />
              Contra-propuesta: {formatDateTime(visit.counterProposedAt)}
              {visit.counterProposeMessage && (
                <span className="text-muted ms-2">— "{visit.counterProposeMessage}"</span>
              )}
            </span>
          )}
        </div>

        <Row className="mb-3">
          <Col md={6}>
            <h6 className="text-muted small fw-bold text-uppercase mb-3">Detalles del Solicitante</h6>
            <div className="d-flex align-items-center mb-2">
              <PersonCircle size={40} className="me-3 text-muted" />
              <div>
                <span className="small fw-bold d-block">{visit.buyerName}</span>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="text-end mb-2">
              <span className="small text-muted">
                <Clock className="me-1" /> Recibida: {formatReceivedDate(visit.createdAt)}
              </span>
            </div>
            <div className="small mb-1">
              <Envelope className="me-2 text-muted" />
              <span className="fw-bold">Correo electrónico:</span> {visit.buyerEmail}
            </div>
            <div className="small">
              <Phone className="me-2 text-muted" />
              <span className="fw-bold">Teléfono:</span> {visit.buyerPhone}
            </div>
          </Col>
        </Row>

        {visit.message && (
          <div className="visit-comment-box mb-3">
            <p className="small mb-0 text-dark">
              <span className="fw-bold">Comentarios:</span> "{visit.message}"
            </p>
          </div>
        )}

        {isPending && (
          <div className="d-flex justify-content-end gap-3 mt-4">
            <Button
              variant="success"
              size="sm"
              onClick={() => onConfirm(visit.id)}
              className="btn-confirm px-4"
              disabled={disabled}
            >
              Confirmar
            </Button>
            <Button
              variant="warning"
              size="sm"
              onClick={() => onSuggest(visit)}
              className="btn-suggest-time px-4"
              disabled={disabled}
            >
              Sugerir otro horario
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onReject(visit.id)}
              className="btn-reject px-4"
              disabled={disabled}
            >
              Rechazar
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default VisitCard;
