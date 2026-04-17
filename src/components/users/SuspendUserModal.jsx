import { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';
import adminService from '../../services/adminService';

/**
 * Modal para suspender a un usuario.
 *
 * @param {{ user: object; open: boolean; onClose: () => void; onSuccess: () => void }} props
 */
export default function SuspendUserModal({ user, open, onClose, onSuccess }) {
  const [suspensionType, setSuspensionType] = useState('temporal'); // 'temporal' | 'indefinida'
  const [suspendedUntil, setSuspendedUntil] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reset al abrir
  useEffect(() => {
    if (open) {
      setSuspensionType('temporal');
      setSuspendedUntil('');
      setSuspensionReason('');
      setError('');
      setFieldErrors({});
    }
  }, [open]);

  // Calcular la fecha mínima (mañana)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  function validate() {
    const errors = {};
    if (suspensionType === 'temporal' && !suspendedUntil) {
      errors.suspendedUntil = 'Seleccioná una fecha de fin de suspensión.';
    }
    if (suspensionReason.trim().length < 10) {
      errors.suspensionReason = 'El motivo debe tener al menos 10 caracteres.';
    }
    if (suspensionReason.trim().length > 500) {
      errors.suspensionReason = 'El motivo no puede superar los 500 caracteres.';
    }
    return errors;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    setError('');

    try {
      const payload = {
        suspendedUntil: suspensionType === 'indefinida' ? null : `${suspendedUntil}T23:59:59`,
        suspensionReason: suspensionReason.trim(),
      };
      await adminService.suspendUser(user.id, payload);

      if (!isMounted.current) return;
      onClose();
      onSuccess();

      await Swal.fire({
        icon: 'success',
        title: 'Usuario suspendido',
        text: 'Usuario suspendido correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      if (!isMounted.current) return;
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Ocurrió un error al suspender el usuario. Intentá nuevamente.'
      );
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  if (!user) return null;

  return (
    <Modal show={open} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Suspender a {user.name}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <Alert variant="danger" className="p-2 fs-6" role="alert" aria-live="assertive">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit} noValidate>
          {/* Tipo de suspensión */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Tipo de suspensión <span className="text-danger">*</span></Form.Label>
            <div className="d-flex gap-4">
              <Form.Check
                type="radio"
                id="susp-temporal"
                label="Suspensión temporal"
                value="temporal"
                checked={suspensionType === 'temporal'}
                onChange={() => setSuspensionType('temporal')}
                disabled={loading}
              />
              <Form.Check
                type="radio"
                id="susp-indefinida"
                label="Suspensión indefinida"
                value="indefinida"
                checked={suspensionType === 'indefinida'}
                onChange={() => setSuspensionType('indefinida')}
                disabled={loading}
              />
            </div>
          </Form.Group>

          {/* Fecha fin (solo si temporal) */}
          {suspensionType === 'temporal' && (
            <Form.Group className="mb-3">
              <Form.Label>
                Suspendido hasta <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                min={minDate}
                value={suspendedUntil}
                onChange={(e) => setSuspendedUntil(e.target.value)}
                disabled={loading}
                isInvalid={!!fieldErrors.suspendedUntil}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.suspendedUntil}
              </Form.Control.Feedback>
            </Form.Group>
          )}

          {/* Motivo */}
          <Form.Group className="mb-3">
            <Form.Label>
              Motivo de suspensión <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              maxLength={500}
              placeholder="Describí el motivo de la suspensión (mínimo 10 caracteres)..."
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              disabled={loading}
              isInvalid={!!fieldErrors.suspensionReason}
            />
            <Form.Control.Feedback type="invalid">
              {fieldErrors.suspensionReason}
            </Form.Control.Feedback>
            <div className="d-flex justify-content-end mt-1">
              <small className={suspensionReason.length >= 500 ? 'text-danger' : 'text-muted'}>
                {500 - suspensionReason.length} caracteres restantes
              </small>
            </div>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger" disabled={loading}>
              {loading ? (
                <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Procesando...</>
              ) : (
                'Suspender usuario'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
