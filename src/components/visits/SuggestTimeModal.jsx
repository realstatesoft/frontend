import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import './visits.scss';

const SuggestTimeModal = ({ show, onHide, visit, onSave }) => {
  const [formData, setFormData] = useState({
    counterProposedAt: '',
    counterProposeMessage: '',
  });
  useEffect(() => {
    if (show) {
      setFormData({ counterProposedAt: '', counterProposeMessage: '' });
    }
  }, [show, visit?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatProposedAt = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!visit?.id) return;
    onSave(visit.id, {
      counterProposedAt: formData.counterProposedAt,
      counterProposeMessage: formData.counterProposeMessage || null,
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">Sugerir otro horario de visita</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4">
        <div className="mb-4 p-3 bg-light rounded-3 border-0">
          <h5 className="fw-bold mb-1">{visit?.propertyTitle}</h5>
          <p className="text-muted small mb-0">
            Horario solicitado por {visit?.buyerName}:{' '}
            <span className="fw-bold text-dark">
              {formatProposedAt(visit?.proposedAt)}
            </span>
          </p>
        </div>

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-bold">Nuevo horario propuesto *</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="counterProposedAt"
                  value={formData.counterProposedAt}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold">Comentarios</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="counterProposeMessage"
              value={formData.counterProposeMessage}
              onChange={handleChange}
              placeholder="Escribe un mensaje para el solicitante..."
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mb-3">
            <Button variant="outline-primary" onClick={onHide} className="btn-cancel-modal rounded-pill px-4">
              Cancelar
            </Button>
            <Button variant="primary" type="submit" className="rounded-pill px-4">
              Enviar Sugerencia
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default SuggestTimeModal;
