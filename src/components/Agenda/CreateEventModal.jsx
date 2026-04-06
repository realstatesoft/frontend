import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { createEvent } from '../../services/agents/agentAgendaService';

const EVENT_TYPE_OPTIONS = [
    { value: 'VISIT',    label: 'Visita' },
    { value: 'MEETING',  label: 'Reunión' },
    { value: 'BLOCKED',  label: 'Bloqueado' },
    { value: 'OTHER',    label: 'Otro' },
];

// Format a Date to "YYYY-MM-DD"
const toDateInput = (d) => {
    if (!d) return '';
    const year  = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day   = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Combine date string "YYYY-MM-DD" and time string "HH:mm" into ISO string for backend
const toISOLocal = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    return `${dateStr}T${timeStr}:00`;
};

const INITIAL_FORM = {
    title:       '',
    eventType:   '',
    date:        '',
    startTime:   '',
    endTime:     '',
    location:    '',
    description: '',
    notes:       '',
};

export default function CreateEventModal({ show, onHide, initialDate, onSuccess }) {
    const [form, setForm]       = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    // Pre-fill date when opened from a day cell
    useEffect(() => {
        if (show) {
            setForm(prev => ({
                ...INITIAL_FORM,
                date: initialDate ? toDateInput(initialDate) : toDateInput(new Date()),
            }));
            setError(null);
        }
    }, [show, initialDate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const startsAt = toISOLocal(form.date, form.startTime);
        const endsAt   = toISOLocal(form.date, form.endTime);

        // Client-side temporal validation
        if (startsAt && endsAt && endsAt <= startsAt) {
            setError('La hora de fin debe ser posterior a la hora de inicio.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title:       form.title,
                eventType:   form.eventType,
                startsAt,
                endsAt,
                location:    form.location    || null,
                description: form.description || null,
                notes:       form.notes       || null,
            };

            await createEvent(payload);
            onSuccess();
            onHide();
        } catch (err) {
            const msg = err.response?.data?.message
                ?? err.response?.data?.error
                ?? 'Error al crear el evento. Intente nuevamente.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold fs-5">Crear un Evento</Modal.Title>
            </Modal.Header>

            <Modal.Body className="px-4 pt-2 pb-0">
                {error && (
                    <Alert variant="danger" className="py-2 small" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                )}

                <Form id="create-event-form" onSubmit={handleSubmit}>
                    {/* Row 1: Título | Fecha | Hora inicio | Hora fin */}
                    <Row className="mb-3 g-2 align-items-end">
                        <Col xs={12} md={5}>
                            <Form.Label className="small fw-semibold text-secondary mb-1">
                                Título <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                placeholder="Ej. Llamada a Cliente María López"
                                value={form.title}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </Col>

                        <Col xs={6} md={3}>
                            <Form.Label className="small fw-semibold text-secondary mb-1">
                                Fecha <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </Col>

                        <Col xs={3} md={2}>
                            <Form.Label className="small fw-semibold text-secondary mb-1">
                                Hora inicio <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="time"
                                name="startTime"
                                value={form.startTime}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </Col>

                        <Col xs={3} md={2}>
                            <Form.Label className="small fw-semibold text-secondary mb-1">
                                Hora fin <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="time"
                                name="endTime"
                                value={form.endTime}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </Col>
                    </Row>

                    {/* Row 2: Tipo | Ubicación */}
                    <Row className="mb-3 g-2 align-items-end">
                        <Col xs={12} md={4}>
                            <Form.Label className="small fw-semibold text-secondary mb-1">
                                Tipo <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Select
                                name="eventType"
                                value={form.eventType}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            >
                                <option value="">Seleccionar tipo...</option>
                                {EVENT_TYPE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </Form.Select>
                        </Col>

                        <Col xs={12} md={8}>
                            <Form.Label className="small fw-semibold text-secondary mb-1">
                                Ubicación
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="location"
                                placeholder="Ej. Oficina central, Av. España 123"
                                value={form.location}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </Col>
                    </Row>

                    {/* Row 3: Descripción */}
                    <Row className="mb-3 g-2">
                        <Col xs={12}>
                            <Form.Label className="small fw-semibold text-secondary mb-1">
                                Descripción
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="description"
                                placeholder="Descripción breve del evento..."
                                value={form.description}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </Col>
                    </Row>

                    {/* Row 4: Notas */}
                    <Row className="mb-1 g-2">
                        <Col xs={12}>
                            <Form.Label className="small fw-semibold text-secondary mb-1">
                                Notas
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="notes"
                                placeholder=""
                                value={form.notes}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>

            <Modal.Footer className="border-0 pt-2 pb-3 px-4">
                <Button
                    variant="outline-secondary"
                    onClick={onHide}
                    disabled={loading}
                    className="px-4"
                >
                    Cancelar
                </Button>
                <Button
                    variant="primary"
                    type="submit"
                    form="create-event-form"
                    disabled={loading}
                    className="px-4"
                >
                    {loading ? 'Guardando...' : 'Guardar'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
