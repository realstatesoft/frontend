import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Badge, Alert } from 'react-bootstrap';
import { getAgentAvailability } from '../../services/visits/visitApi';
import { Calendar3, Clock, InfoCircle } from 'react-bootstrap-icons';
import './visits.scss';

const SuggestTimeModal = ({ show, onHide, visit, onSave }) => {
  const [formData, setFormData] = useState({
    counterProposedAt: '',
    counterProposeMessage: '',
  });

  // Availability states
  const [busySlots, setBusySlots] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [lastCheckDate, setLastCheckDate] = useState(null);

  useEffect(() => {
    if (show) {
      setFormData({ counterProposedAt: '', counterProposeMessage: '' });
      setBusySlots([]);
      setLastCheckDate(null);
    }
  }, [show, visit?.id]);

  useEffect(() => {
    if (!show || !visit?.agentId || !formData.counterProposedAt) return;

    const dateStr = formData.counterProposedAt.split('T')[0];
    if (dateStr === lastCheckDate || !dateStr) return;

    const fetchAvailability = async () => {
      setLoadingAvailability(true);
      try {
        const slots = await getAgentAvailability(visit.agentId, dateStr);
        setBusySlots(slots);
        setLastCheckDate(dateStr);
      } catch (err) {
        console.error('Error fetching availability:', err);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [formData.counterProposedAt, visit?.agentId, show, lastCheckDate]);

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

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Generate available slots (07:00 to 19:00)
  const generateAvailableSlots = () => {
    if (!formData.counterProposedAt || !formData.counterProposedAt.split('T')[0] || loadingAvailability) return [];
    
    const dateStr = formData.counterProposedAt.split('T')[0];
    const slots = [];
    
    // 07:00 to 18:00
    for (let hour = 7; hour <= 18; hour++) {
      const slotStart = new Date(`${dateStr}T${hour.toString().padStart(2, '0')}:00:00`);
      const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
      
      const isBusy = busySlots.some(busy => {
        const busyStart = new Date(busy.startTime);
        const busyEnd = new Date(busy.endTime);
        return (slotStart < busyEnd && slotEnd > busyStart);
      });
      
      if (!isBusy) {
        slots.push({ start: slotStart, end: slotEnd });
      }
    }
    return slots;
  };

  const availableSlots = generateAvailableSlots();

  const selectSlot = (slot) => {
    const dateStr = formData.counterProposedAt.split('T')[0];
    const timeStr = slot.start.toTimeString().split(' ')[0].substring(0, 5);
    setFormData(prev => ({ ...prev, counterProposedAt: `${dateStr}T${timeStr}` }));
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
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold d-flex align-items-center gap-2">
          <Calendar3 className="text-primary" />
          Sugerir otro horario de visita
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pt-3">
        <div className="mb-4 p-3 bg-light rounded-4 border-0 shadow-sm" style={{ border: '1px solid #e0ddd8', backgroundColor: '#f8fafc' }}>
          <h5 className="fw-bold mb-1 text-dark">{visit?.propertyTitle}</h5>
          <p className="text-muted small mb-0">
            Horario solicitado por {visit?.buyerName}:{' '}
            <span className="fw-bold text-primary">
              {formatProposedAt(visit?.proposedAt)}
            </span>
          </p>
        </div>

        <Form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-uppercase text-muted" style={{ fontSize: '0.7rem' }}>
                1. Elige la nueva fecha
              </Form.Label>
              <Form.Control
                type="date"
                name="datePart"
                value={formData.counterProposedAt ? formData.counterProposedAt.split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value;
                  if (!date) {
                    setFormData(prev => ({ ...prev, counterProposedAt: '' }));
                    return;
                  }
                  const currentTime = formData.counterProposedAt && formData.counterProposedAt.includes('T') ? formData.counterProposedAt.split('T')[1] : '09:00';
                  setFormData(prev => ({ ...prev, counterProposedAt: `${date}T${currentTime}` }));
                }}
                required
                className="border-2"
                style={{ borderRadius: '10px' }}
              />
            </Form.Group>

            {/* Availability Selection Section */}
            {visit?.agentId && formData.counterProposedAt && formData.counterProposedAt.split('T')[0] && (
              <div className="mt-4 p-4 bg-white border-soft rounded-md shadow-soft" style={{ border: '1px solid #e0ddd8', borderRadius: '12px' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="small fw-semibold text-dark">
                    <Clock size={16} className="me-2 text-primary" />
                    2. Selecciona un horario libre en tu agenda
                  </span>
                  {loadingAvailability && <Spinner animation="border" size="sm" variant="primary" />}
                </div>

                {!loadingAvailability && availableSlots.length === 0 && (
                  <Alert variant="warning" className="small py-2 border-0" style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', color: '#f59e0b' }}>
                    No tienes horarios libres para este día. Intenta con otra fecha.
                  </Alert>
                )}

                {!loadingAvailability && availableSlots.length > 0 && (
                  <div className="row g-2 overflow-auto" style={{ maxHeight: '240px', padding: '5px' }}>
                    {availableSlots.map((slot, index) => {
                      const slotTime = formatTime(slot.start);
                      const isSelected = formData.counterProposedAt.includes(slotTime);
                      return (
                        <div key={index} className="col-6 col-md-4">
                          <Button
                            variant={isSelected ? "primary" : "outline-secondary"}
                            size="sm"
                            className={`w-100 py-2 border-soft ${isSelected ? 'fw-bold shadow-sm' : 'fw-normal text-secondary'}`}
                            onClick={() => selectSlot(slot)}
                            style={{ 
                              borderRadius: '10px', 
                              fontSize: '0.85rem',
                              backgroundColor: isSelected ? '#2563eb' : 'transparent',
                              borderColor: isSelected ? '#2563eb' : '#e0ddd8',
                              color: isSelected ? '#fff' : '#64748b'
                            }}
                          >
                            {slotTime}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Shows busy slots for context */}
                {busySlots.length > 0 && (
                  <div className="mt-4 border-top pt-3">
                    <p className="text-muted mb-2 fw-bold" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ocupado actualmente:</p>
                    <div className="d-flex flex-wrap gap-1">
                      {busySlots.map((busy, idx) => (
                        <Badge key={idx} bg="danger-subtle" className="text-danger fw-normal py-1 px-2 border-0" style={{ fontSize: '0.7rem', backgroundColor: 'rgba(239, 68, 68, 0.08)' }}>
                          {new Date(busy.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - {busy.reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold text-uppercase text-muted" style={{ fontSize: '0.7rem' }}>
              3. Mensaje para el comprador
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="counterProposeMessage"
              value={formData.counterProposeMessage}
              onChange={handleChange}
              placeholder="Ej: Hola, ese horario me queda mejor. ¿Te parece bien?"
              style={{ borderRadius: '10px' }}
            />
          </Form.Group>

          <div className="d-grid gap-2 mb-3">
            <Button 
                variant="primary" 
                type="submit" 
                className="py-3 fw-bold shadow-sm" 
                disabled={!formData.counterProposedAt || !formData.counterProposedAt.includes('T') || formData.counterProposedAt.endsWith('T09:00')} 
                style={{ borderRadius: '12px', backgroundColor: '#2563eb', borderColor: '#2563eb' }}
            >
              ENVIAR PROPUESTA
            </Button>
            <Button variant="link" onClick={onHide} className="text-muted text-decoration-none small">
              Cancelar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default SuggestTimeModal;
