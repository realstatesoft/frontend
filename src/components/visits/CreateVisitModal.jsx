import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { createVisitRequest } from '../../services/visits/visitApi';

const CreateVisitModal = ({ show, onHide, property, onSuccess }) => {
  const [formData, setFormData] = useState({
    proposedAt: '',
    message: '',
    buyerName: '',
    buyerEmail: '',
    buyerPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        propertyId: property.id,
        proposedAt: formData.proposedAt,
        message: formData.message,
        buyerName: formData.buyerName || null,
        buyerEmail: formData.buyerEmail || null,
        buyerPhone: formData.buyerPhone || null
      };

      await createVisitRequest(payload);
      onSuccess();
      onHide();
      // Reset form
      setFormData({
        proposedAt: '',
        message: '',
        buyerName: '',
        buyerEmail: '',
        buyerPhone: ''
      });
    } catch (err) {
      console.error('Error al crear solicitud:', err);
      setError(err.response?.data?.message || 'Error al enviar la solicitud de visita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">Agendar Visita</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4">
        <div className="mb-4 p-3 bg-light rounded-3 border-0">
          <h6 className="fw-bold mb-1">{property?.title}</h6>
          <p className="text-muted small mb-0">{property?.address}</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Fecha y Hora Propuesta *</Form.Label>
            <Form.Control
              type="datetime-local"
              name="proposedAt"
              value={formData.proposedAt}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold">Tu Nombre (opcional)</Form.Label>
                <Form.Control
                  type="text"
                  name="buyerName"
                  placeholder="Tu nombre completo"
                  value={formData.buyerName}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Comentarios / Mensaje</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Hola, me interesa conocer la propiedad..."
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mb-3">
            <Button variant="outline-dark" onClick={onHide} className="rounded-pill px-4" disabled={loading}>
              Cancelar
            </Button>
            <Button variant="dark" type="submit" className="rounded-pill px-4" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateVisitModal;
