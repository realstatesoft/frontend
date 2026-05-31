import { useState, useEffect, useMemo } from 'react';
import { Modal, Form, Spinner } from 'react-bootstrap';
import { FiSave, FiX } from 'react-icons/fi';
import Button from '../common/Button/Button';
import Swal from 'sweetalert2';
import useFormatters from '../../hooks/useFormatters';
import { useFormValidation } from '../../hooks/useFormValidation';
import NumericInput from '../common/NumericInput';

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Efectivo' },
  { value: 'TRANSFER', label: 'Transferencia' },
  { value: 'CHECK', label: 'Cheque' },
  { value: 'OTHER', label: 'Otro' },
];

export default function ManualPaymentModal({ show, onHide, installments, onSave, initialInstallmentId }) {
  const { formatCurrency } = useFormatters();
  const pendingInstallments = installments?.filter(i => ['PENDING', 'OVERDUE', 'PARTIAL'].includes(i.status)) || [];

  // Memoized date boundaries (computed once on mount)
  const maxDateIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  // Business rule: payments cannot be recorded more than 10 years in the past
  const minDateIso = useMemo(
    () => new Date(new Date().getFullYear() - 10, 0, 1).toISOString().slice(0, 10),
    []
  );

  const initialFormState = {
    installmentId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    method: 'TRANSFER',
    reference: '',
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { fieldErrors, validate, clearFieldError, clearAllErrors } = useFormValidation();

  useEffect(() => {
    if (initialInstallmentId) {
      const inst = pendingInstallments.find(i => String(i.id) === String(initialInstallmentId));
      setFormData(prev => ({
        ...prev,
        installmentId: String(initialInstallmentId),
        amount: inst ? (inst.balance || inst.totalAmount) : '',
      }));
    }
  }, [initialInstallmentId, pendingInstallments]);

  useEffect(() => {
    if (!show) {
      clearAllErrors();
    }
  }, [show, clearAllErrors]);

  const handleInstallmentChange = (e) => {
    const instId = e.target.value;
    const inst = pendingInstallments.find(i => String(i.id) === instId);
    setFormData(prev => ({
      ...prev,
      installmentId: instId,
      amount: inst ? inst.balance || inst.totalAmount : '',
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const valid = validate({
      installmentId: { value: formData.installmentId, label: "Cuota", required: true },
      amount: { value: formData.amount && parseFloat(formData.amount) > 0 ? formData.amount : "", label: "Monto", required: true },
      paymentDate: { value: formData.paymentDate, label: "Fecha de pago", required: true },
      method: { value: formData.method, label: "Método de pago", required: true },
    });
    if (!valid) return;

    const today = maxDateIso;
    if (formData.paymentDate > today) {
      Swal.fire('Error', 'La fecha de pago no puede ser futura', 'error');
      return;
    }

    const amount = parseFloat(formData.amount);
    const selected = pendingInstallments.find(i => String(i.id) === formData.installmentId);
    const maxAmount = selected?.balance || selected?.totalAmount || 0;
    if (amount <= 0 || amount > maxAmount) {
      Swal.fire('Error', `El monto debe ser mayor a 0 y no superar el saldo pendiente (${formatCurrency(maxAmount)})`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData.installmentId, {
        amount,
        date: formData.paymentDate,
        method: formData.method,
        reference: formData.reference,
        notes: formData.notes,
      });
      setFormData(initialFormState);
      Swal.fire({
        icon: 'success',
        title: 'Pago registrado',
        text: 'El pago se registró correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });
      onHide();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'No se pudo registrar el pago', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Registrar Pago Manual</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Cuota a aplicar *</Form.Label>
            <Form.Select 
              name="installmentId" 
              value={formData.installmentId} 
              onChange={(e) => { handleInstallmentChange(e); clearFieldError('installmentId'); }}
              className={fieldErrors.installmentId ? 'field-error' : ''}
            >
              <option value="">Selecciona una cuota</option>
              {pendingInstallments.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.period || `Cuota ${inst.installmentNumber}`} - Pendiente: {formatCurrency(inst.balance || inst.totalAmount)}
                </option>
              ))}
            </Form.Select>
            {fieldErrors.installmentId && <div className="field-error-msg">{fieldErrors.installmentId}</div>}
            {pendingInstallments.length === 0 && (
              <Form.Text className="text-danger">No hay cuotas pendientes.</Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Monto pagado *</Form.Label>
            <NumericInput
              allowDecimal
              name="amount"
              value={formData.amount}
              onChange={(e) => { handleChange(e); clearFieldError('amount'); }}
              placeholder="0.00"
              disabled={!formData.installmentId}
              className={fieldErrors.amount ? 'field-error' : ''}
            />
            {fieldErrors.amount && <div className="field-error-msg">{fieldErrors.amount}</div>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha de pago *</Form.Label>
            <Form.Control
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              max={maxDateIso}
              min={minDateIso}
              onChange={(e) => { handleChange(e); clearFieldError('paymentDate'); }}
              className={fieldErrors.paymentDate ? 'field-error' : ''}
            />
            {fieldErrors.paymentDate && <div className="field-error-msg">{fieldErrors.paymentDate}</div>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Método de pago *</Form.Label>
            <Form.Select
              name="method"
              value={formData.method}
              onChange={(e) => { handleChange(e); clearFieldError('method'); }}
              className={fieldErrors.method ? 'field-error' : ''}
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Form.Select>
            {fieldErrors.method && <div className="field-error-msg">{fieldErrors.method}</div>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Referencia / Comprobante (Opcional)</Form.Label>
            <Form.Control
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="Ej: TRX-12345"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notas (Opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            <FiX /> Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || pendingInstallments.length === 0}>
            {isSubmitting ? <Spinner size="sm" /> : <><FiSave /> Guardar Pago</>}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
