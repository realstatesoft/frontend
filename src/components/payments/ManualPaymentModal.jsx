import { useState } from 'react';
import { Modal, Form, Spinner } from 'react-bootstrap';
import { FiSave, FiX } from 'react-icons/fi';
import Button from '../common/Button/Button';
import Swal from 'sweetalert2';
import useFormatters from '../../hooks/useFormatters';

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Efectivo' },
  { value: 'TRANSFER', label: 'Transferencia' },
  { value: 'CHECK', label: 'Cheque' },
  { value: 'OTHER', label: 'Otro' },
];

export default function ManualPaymentModal({ show, onHide, installments, onSave }) {
  const { formatCurrency } = useFormatters();
  const pendingInstallments = installments?.filter(i => ['PENDING', 'OVERDUE', 'PARTIAL'].includes(i.status)) || [];

  const [formData, setFormData] = useState({
    installmentId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    method: 'TRANSFER',
    reference: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!formData.installmentId || !formData.amount || !formData.paymentDate || !formData.method) {
      Swal.fire('Error', 'Completa los campos obligatorios', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData.installmentId, {
        amount: parseFloat(formData.amount),
        date: formData.paymentDate,
        method: formData.method,
        reference: formData.reference,
        notes: formData.notes,
      });
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
              onChange={handleInstallmentChange}
              required
            >
              <option value="">Selecciona una cuota</option>
              {pendingInstallments.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.period || `Cuota ${inst.installmentNumber}`} - Pendiente: {formatCurrency(inst.balance || inst.totalAmount)}
                </option>
              ))}
            </Form.Select>
            {pendingInstallments.length === 0 && (
              <Form.Text className="text-danger">No hay cuotas pendientes.</Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Monto pagado *</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              required
              disabled={!formData.installmentId}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha de pago *</Form.Label>
            <Form.Control
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Método de pago *</Form.Label>
            <Form.Select
              name="method"
              value={formData.method}
              onChange={handleChange}
              required
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Form.Select>
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
