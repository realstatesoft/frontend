import { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { Check } from 'react-bootstrap-icons';
import reservationApi from '../../../services/reservations/reservationApi';
import styles from './ReserveModal.module.scss';
import { useTranslation } from 'react-i18next';
import { useFormValidation } from '../../../hooks/useFormValidation';
import NumericInput from '../../common/NumericInput';
import useCurrencyStore from '../../../store/useCurrencyStore';
import useFormatters from '../../../hooks/useFormatters';

const CURRENCY_SYMBOL = {
  PYG: '₲',
  USD: '$',
  BRL: 'R$',
};

export default function ReserveModal({ show, property, defaultPercent, onClose, onCreated }) {
  const { t } = useTranslation('reservations');
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  const currencySymbol = CURRENCY_SYMBOL[selectedCurrency] ?? '$';
  const { formatCurrency } = useFormatters();
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
            <InputGroup>
              <InputGroup.Text className={styles.currencyPrefix}>{currencySymbol}</InputGroup.Text>
              <NumericInput
                allowDecimal
                value={amount}
                onChange={(e) => { setAmount(e.target.value); clearFieldError('amount'); }}
                className={fieldErrors.amount ? 'field-error' : ''}
                isInvalid={!!fieldErrors.amount}
              />
            </InputGroup>
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
        <Modal.Footer className="d-flex justify-content-end gap-2">
          <Button variant="outline-secondary" onClick={onClose} disabled={submitting}>
            {t('modal.cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={submitting} className={styles.submitBtn}>
            {submitting
              ? <><Spinner size="sm" animation="border" className="me-2" />{t('modal.submitting')}</>
              : <><Check size={16} className="me-1" />{t('modal.submit')}</>}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
