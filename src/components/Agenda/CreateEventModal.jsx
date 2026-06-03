import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { createEvent } from '../../services/agents/agentAgendaService';
import { useFormValidation } from '../../hooks/useFormValidation';

const EVENT_TYPE_OPTIONS = (t) => [
    { value: 'VISIT',    label: t('options.visit') },
    { value: 'MEETING',  label: t('options.meeting') },
    { value: 'BLOCKED',  label: t('options.blocked') },
    { value: 'OTHER',    label: t('options.other') },
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
    const { t } = useTranslation('agenda');
    const [form, setForm]       = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);
    const { fieldErrors, validate, clearFieldError } = useFormValidation();
    const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const maxDateStr = useMemo(() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        const yyyy = d.getFullYear();
        const mm   = String(d.getMonth() + 1).padStart(2, '0');
        const dd   = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }, []);

    // Pre-fill date when opened from a day cell
    useEffect(() => {
        if (show) {
            let d = initialDate ? new Date(initialDate) : new Date();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (d < today) {
                d = today;
            }
            setForm({
                ...INITIAL_FORM,
                date: toDateInput(d),
            });
            setError(null);
        }
    }, [show, initialDate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        clearFieldError(name);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const valid = validate({
            title: { value: form.title, label: t('fields.title'), required: true },
            date: { value: form.date, label: t('fields.date'), required: true },
            startTime: { value: form.startTime, label: t('fields.startTime'), required: true },
            endTime: { value: form.endTime, label: t('fields.endTime'), required: true },
            eventType: { value: form.eventType, label: t('fields.type'), required: true },
        });
        if (!valid) return;

        if (form.date < todayStr) {
            setError(t('errors.datePast'));
            return;
        }
        if (form.date > maxDateStr) {
            setError(t('errors.dateTooFar'));
            return;
        }

        const startsAt = toISOLocal(form.date, form.startTime);
        const endsAt   = toISOLocal(form.date, form.endTime);

        // Client-side temporal validation
        if (startsAt && endsAt && endsAt <= startsAt) {
            setError(t('errors.endAfterStart'));
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
                ?? t('errors.createFailed');
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold fs-5">{t('title')}</Modal.Title>
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
                                {t('fields.title')} <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                placeholder={t('placeholders.title')}
                                value={form.title}
                                onChange={handleChange}
                                disabled={loading}
                                className={fieldErrors.title ? 'field-error' : ''}
                            />
                            {fieldErrors.title && <div className="field-error-msg">{fieldErrors.title}</div>}
                        </Col>

                        <Col xs={6} md={3}>
                            <Form.Label className="small fw-semibold text-secondary mb-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span>{t('fields.date')} <span className="text-danger">*</span></span>
                                <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 400 }}>Máx. {maxDateStr}</span>
                            </Form.Label>
                            <Form.Control
                                type="date"
                                name="date"
                                value={form.date}
                                min={todayStr}
                                max={maxDateStr}
                                onChange={handleChange}
                                disabled={loading}
                                className={fieldErrors.date ? 'field-error' : ''}
                            />
                            {fieldErrors.date && <div className="field-error-msg">{fieldErrors.date}</div>}
                        </Col>

                        <Col xs={3} md={2}>
                            <Form.Label className="small fw-semibold text-secondary mb-1">
                                {t('fields.startTime')} <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="time"
                                name="startTime"
                                value={form.startTime}
                                onChange={handleChange}
                                disabled={loading}
                                className={fieldErrors.startTime ? 'field-error' : ''}
                            />
                            {fieldErrors.startTime && <div className="field-error-msg">{fieldErrors.startTime}</div>}
                        </Col>

                        <Col xs={3} md={2}>
                            <Form.Label className="small fw-semibold text-secondary mb-1">
                                {t('fields.endTime')} <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="time"
                                name="endTime"
                                value={form.endTime}
                                onChange={handleChange}
                                disabled={loading}
                                className={fieldErrors.endTime ? 'field-error' : ''}
                            />
                            {fieldErrors.endTime && <div className="field-error-msg">{fieldErrors.endTime}</div>}
                        </Col>
                    </Row>

                    {/* Row 2: Tipo | Ubicación */}
                    <Row className="mb-3 g-2 align-items-end">
                        <Col xs={12} md={4}>
                            <Form.Label className="small fw-semibold text-secondary mb-1">
                                {t('fields.type')} <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Select
                                name="eventType"
                                value={form.eventType}
                                onChange={handleChange}
                                disabled={loading}
                                className={fieldErrors.eventType ? 'field-error' : ''}
                            >
                                <option value="">{t('placeholders.type')}</option>
                                {EVENT_TYPE_OPTIONS(t).map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </Form.Select>
                            {fieldErrors.eventType && <div className="field-error-msg">{fieldErrors.eventType}</div>}
                        </Col>

                        <Col xs={12} md={8}>
                            <Form.Label className="small fw-semibold text-secondary mb-1">
                                {t('fields.location')}
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="location"
                                placeholder={t('placeholders.location')}
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
                                {t('fields.description')}
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="description"
                                placeholder={t('placeholders.description')}
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
                                {t('fields.notes')}
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="notes"
                                placeholder={t('placeholders.notes')}
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
                    {t('cancel')}
                </Button>
                <Button
                    variant="primary"
                    type="submit"
                    form="create-event-form"
                    disabled={loading}
                    className="px-4"
                >
                    {loading ? t('saving') : t('save')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
