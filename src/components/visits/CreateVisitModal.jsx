import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import { createVisitRequest, getAgentAvailability } from '../../services/visits/visitApi';
import { Calendar3, Clock, InfoCircle } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { useFormValidation } from '../../hooks/useFormValidation';

const CreateVisitModal = ({ show, onHide, property, agentId, onSuccess }) => {
  const { t } = useTranslation('visits');
  const [formData, setFormData] = useState({
    proposedAt: '',
    message: '',
    buyerName: '',
    buyerEmail: '',
    buyerPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { fieldErrors, validate, clearFieldError } = useFormValidation();
  
  // Availability states
  const [busySlots, setBusySlots] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [lastCheckDate, setLastCheckDate] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Effect to fetch availability when date changes
  useEffect(() => {
    if (!show || !agentId || !formData.proposedAt) return;

    const dateStr = formData.proposedAt.split('T')[0];
    if (dateStr === lastCheckDate || !dateStr) return;

    const fetchAvailability = async () => {
      setLoadingAvailability(true);
      try {
        const slots = await getAgentAvailability(agentId, dateStr);
        setBusySlots(slots);
        setLastCheckDate(dateStr);
      } catch (err) {
        console.error('Error fetching availability:', err);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [formData.proposedAt, agentId, show, lastCheckDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!property?.id) return;

    const valid = validate({
      proposedAt: { value: formData.proposedAt && formData.proposedAt.includes('T') ? formData.proposedAt : "", label: t('create.step1'), required: true },
    });
    if (!valid) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        propertyId: property?.id,
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
      setBusySlots([]);
      setLastCheckDate(null);
    } catch (err) {
      console.error('Error al crear solicitud:', err);
      setError(err.response?.data?.message || t('create.error'));
    } finally {
      setLoading(false);
    }
  };

  // Helper to format slot time
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Generate available slots (07:00 to 19:00)
  const generateAvailableSlots = () => {
    if (!formData.proposedAt || !formData.proposedAt.split('T')[0] || loadingAvailability) return [];
    
    const dateStr = formData.proposedAt.split('T')[0];
    const slots = [];
    
    // Start from 07:00 to 18:00 (last slot ends at 19:00)
    for (let hour = 7; hour <= 18; hour++) {
      const slotStart = new Date(`${dateStr}T${hour.toString().padStart(2, '0')}:00:00`);
      const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
      
      // Check if this slot overlaps with any busy slot
      const isBusy = busySlots.some(busy => {
        const busyStart = new Date(busy.startTime);
        const busyEnd = new Date(busy.endTime);
        // Overlap logic
        return (slotStart < busyEnd && slotEnd > busyStart);
      });
      
      if (!isBusy) {
        slots.push({
          start: slotStart,
          end: slotEnd,
          label: `${formatTime(slotStart)} - ${formatTime(slotEnd)}`
        });
      }
    }
    return slots;
  };

  const availableSlots = generateAvailableSlots();

  const selectSlot = (slot) => {
    const dateStr = formData.proposedAt.split('T')[0];
    const timeStr = slot.start.toTimeString().split(' ')[0].substring(0, 5);
    setFormData(prev => ({ ...prev, proposedAt: `${dateStr}T${timeStr}:00` }));
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold d-flex align-items-center gap-2">
          <Calendar3 className="text-primary" />
          {t('create.title')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pt-3">
        <div className="mb-4 p-3 bg-light rounded-3 border-0">
          <h6 className="fw-bold mb-1 text-dark">{property?.title}</h6>
          <p className="text-muted small mb-0">{property?.address}</p>
        </div>

        {error && <Alert variant="danger" className="py-2 small"><InfoCircle className="me-2" />{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-uppercase text-muted" style={{ fontSize: '0.7rem' }}>
                {t('create.step1')}
              </Form.Label>
              <Form.Control
                type="date"
                name="datePart"
                value={formData.proposedAt ? formData.proposedAt.split('T')[0] : ''}
                min={new Date().toLocaleDateString('en-CA')}
                onChange={(e) => {
                  const date = e.target.value;
                  setFormData(prev => ({ ...prev, proposedAt: date }));
                  if (!date) setBusySlots([]);
                }}
                required
                className="border-2"
                style={{ borderRadius: '10px' }}
              />
            </Form.Group>

            {/* Availability Selection Section */}
            {formData.proposedAt && formData.proposedAt.split('T')[0] && (
              <div className="mt-4 p-4 bg-white border-soft rounded-md shadow-soft" style={{ border: '1px solid #e0ddd8', borderRadius: '12px' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="small fw-semibold text-dark">
                    <Clock size={16} className="me-2 text-primary" />
                    {t('create.step2')}
                  </span>
                  {loadingAvailability && <Spinner animation="border" size="sm" variant="primary" />}
                </div>

                {!agentId && (
                  <Alert variant="info" className="py-2 border-0" style={{ backgroundColor: 'rgba(37, 99, 235, 0.05)', color: '#2563eb', fontSize: '0.8rem' }}>
                    <InfoCircle className="me-2" />
                    {t('create.noAgent')}
                  </Alert>
                )}

                {!loadingAvailability && availableSlots.length === 0 && (
                  <Alert variant="warning" className="small py-2 border-0" style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', color: '#f59e0b' }}>
                    {t('create.noSlots')}
                  </Alert>
                )}

                {!loadingAvailability && availableSlots.length > 0 && (
                  <>
                    <p className="text-muted small mb-3">{t('create.hint')}</p>
                    <div className="row g-2 overflow-auto" style={{ maxHeight: '240px', padding: '5px' }}>
                      {availableSlots.map((slot, index) => {
                        const slotTime = formatTime(slot.start);
                        const isSelected = formData.proposedAt.includes(slotTime);
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
                  </>
                )}
                
                {formData.proposedAt && formData.proposedAt.includes('T') && (
                  <div className="mt-4 text-center p-3 rounded-md" style={{ backgroundColor: '#f8fafc', border: '1px dashed #2563eb', borderRadius: '8px' }}>
                    <span className="small fw-semibold text-primary">
                      {t('create.selected', {
                        value: new Date(formData.proposedAt).toLocaleString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-uppercase text-muted" style={{ fontSize: '0.7rem' }}>
              {t('create.step3')}
            </Form.Label>
            <Form.Control
              type="text"
              name="buyerName"
              placeholder={t('create.contactPlaceholder')}
              value={formData.buyerName}
              onChange={handleChange}
              style={{ borderRadius: '8px' }}
              className="mb-2"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold text-uppercase text-muted" style={{ fontSize: '0.7rem' }}>
              {t('create.step4')}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={t('create.messagePlaceholder')}
              style={{ borderRadius: '8px' }}
            />
          </Form.Group>

          <div className="d-grid gap-2 mb-2">
            <Button 
              variant="dark" 
              type="submit" 
              className="py-3 fw-bold shadow-sm" 
              disabled={loading || !formData.proposedAt || !formData.proposedAt.includes('T')} 
              style={{ borderRadius: '12px' }}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {t('create.submitting')}
                </>
              ) : t('create.submit').toUpperCase()}
            </Button>
            <Button variant="link" onClick={onHide} className="text-muted text-decoration-none small" disabled={loading}>
              {t('create.close', { defaultValue: 'Cerrar' })}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateVisitModal;
