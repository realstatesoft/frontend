import { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Send } from 'react-bootstrap-icons';
import reservationApi from '../../../services/reservations/reservationApi';
import { formatCurrency } from '../../../utils/formatters';
import styles from './ReserveModal.module.scss';
import { useTranslation } from 'react-i18next';
import { useFormValidation } from '../../../hooks/useFormValidation';

export default function ReserveModal({ show, property, defaultPercent, onClose, onCreated }) {
  const { t } = useTranslation('reservations');
  const initialAmount = property
    ? Number(((Number(property.price) || 0) * (Number(defaultPercent) || 0) / 100).toFixed(2))
    : 0;

  const [amount, setAmount] = useState(initialAmount);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { fieldErrors, validate, clearFieldError } = useFormValidation();

  useEffect(() => {
    setAmount(initialAmount);
    setNotes('');
    setError(null);
  }, [show, property?.id, initialAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const valid = validate({
      amount: { value: amount, label: t('modal.amount'), required: true },
    });
    if (!valid) return;

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError(t('modal.invalidAmount'));
      return;
    }

    setSubmitting(true);
    try {
      const res = await reservationApi.createReservation({
        propertyId: property.id,
        amount: numericAmount,
        notes: notes ?? '',
      });
      onCreated?.(res.data?.data);
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message || t('modal.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{t('modal.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.body}>
          <p className="mb-3">
            {t('modal.description', { title: property?.title })}
          </p>
          <Form.Group className="mb-3" controlId="reserveAmount">
            <Form.Label>{t('modal.amount')}</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); clearFieldError('amount'); }}
              className={fieldErrors.amount ? 'field-error' : ''}
              isInvalid={!!fieldErrors.amount}
            />
            {fieldErrors.amount && <div className="field-error-msg">{fieldErrors.amount}</div>}
            <div className={styles.infoBox}>
              <span className={styles.infoLabel}>{t('modal.suggestion', { percent: defaultPercent })}</span>
              <span className={styles.infoValue} data-testid="reserve-amount-formatted">
                {formatCurrency(Number(amount) || 0)}
              </span>
            </div>
          </Form.Group>

          <Form.Group className="mb-3" controlId="reserveNotes">
            <Form.Label>{t('modal.notes')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              maxLength={1000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className={styles.charCount}>{notes.length}/1000</div>
          </Form.Group>
          {error && <Alert variant="danger" role="alert">{error}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            {t('modal.cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={submitting} className={styles.submitBtn}>
            {submitting
              ? <><Spinner size="sm" animation="border" className="me-2" />{t('modal.submitting')}</>
              : <><Send size={14} />{t('modal.submit')}</>}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
