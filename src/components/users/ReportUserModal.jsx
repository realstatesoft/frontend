import { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import userReportsApi from '../../services/userReportsApi';
import { useTranslation } from 'react-i18next';

/** Razones de reporte con etiquetas en español */
const REPORT_REASONS = [
  { value: 'SPAM', label: 'Spam o publicidad engañosa' },
  { value: 'COMPORTAMIENTO_INAPROPIADO', label: 'Comportamiento inapropiado' },
  { value: 'INFORMACION_FALSA', label: 'Información falsa o engañosa' },
  { value: 'ACOSO', label: 'Acoso o intimidación' },
  { value: 'FRAUDE', label: 'Fraude o estafa' },
  { value: 'OTRO', label: 'Otro' },
];

/**
 * Modal para reportar a un usuario.
 *
 * @param {{ reportedUser: { id: number; name: string }; open: boolean; onClose: () => void }} props
 */
export default function ReportUserModal({ reportedUser, open, onClose }) {
  const { t } = useTranslation('showProperty');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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
      setReason('');
      setDescription('');
      setError('');
      setSuccess(false);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return;

    setLoading(true);
    setError('');

    try {
      await userReportsApi.createUserReport({
        reportedUserId: reportedUser.id,
        reason,
        description: description.trim() || undefined,
      });

      if (!isMounted.current) return;
      setSuccess(true);
    } catch (err) {
      if (!isMounted.current) return;

      // Detectar duplicado
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.response?.data?.error || '';
      if (status === 409) {
        setError(t('reportUser.duplicate', { defaultValue: 'Ya enviaste un reporte para este usuario. Nuestro equipo lo está revisando.' }));
      } else {
        setError(msg || t('reportUser.error', { defaultValue: 'Ocurrió un error al enviar el reporte. Por favor, intentá nuevamente.' }));
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  if (!reportedUser) return null;

  return (
    <Modal show={open} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('reportUser.title', { defaultValue: `Reportar a ${reportedUser.name}` })}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {success ? (
          <Alert variant="success" className="mb-0" aria-live="polite">
            <strong>{t('reportUser.successTitle', { defaultValue: 'Reporte enviado.' })}</strong> {t('reportUser.successText', { defaultValue: 'Lo revisaremos a la brevedad. Gracias por contribuir a la seguridad de la plataforma.' })}
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit} noValidate>
            <p className="mb-4 text-muted" style={{ fontSize: '0.9rem' }}>
              {t('reportUser.description', { defaultValue: 'Si considerás que este usuario incumple nuestras normas, completá el formulario. Tu reporte es anónimo y será revisado por nuestro equipo.' })}
            </p>

            {error && (
              <Alert variant="danger" className="p-2 fs-6" role="alert" aria-live="assertive">
                {error}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>
                {t('reportUser.reasonLabel', { defaultValue: 'Motivo del reporte' })} <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
                required
              >
                <option value="">{t('reportUser.selectReason', { defaultValue: 'Seleccioná un motivo...' })}</option>
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('reportUser.descriptionLabel', { defaultValue: 'Descripción' })} <span className="text-muted">({t('reportUser.optional', { defaultValue: 'opcional' })})</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                maxLength={1000}
                placeholder={t('reportUser.descriptionPlaceholder', { defaultValue: 'Describí con más detalle el problema...' })}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
              <div className="d-flex justify-content-end mt-1">
                <small className={description.length >= 1000 ? 'text-danger' : 'text-muted'}>
                  {1000 - description.length} caracteres restantes
                </small>
              </div>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={handleClose} disabled={loading}>
                {t('reportUser.cancel', { defaultValue: 'Cancelar' })}
              </Button>
              <Button type="submit" variant="primary" disabled={!reason || loading}>
                {loading ? (
                  <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> {t('reportUser.sending', { defaultValue: 'Enviando...' })}</>
                ) : (
                  t('reportUser.submit', { defaultValue: 'Enviar reporte' })
                )}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>

      {success && (
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            {t('reportUser.close', { defaultValue: 'Cerrar' })}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
}
