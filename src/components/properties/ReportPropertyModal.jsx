import { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import propertyFlagsApi from '../../services/propertyFlagsApi';
import { useTranslation } from 'react-i18next';

export default function ReportPropertyModal({ propertyId, isOpen, onClose, onSuccess }) {
  const { t } = useTranslation('showProperty');
  const [flagType, setFlagType] = useState('');
  const [reason, setReason] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!flagType || reason.trim().length < 10) return;

    setLoading(true);
    setError('');

    try {
      const normalizedReason = reason.trim();
      await propertyFlagsApi.createPropertyFlag(propertyId, { flagType, reason: normalizedReason });
      
      if (!isMounted.current) return;
      
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      if (!isMounted.current) return;
      
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        t('reportProperty.error')
      );
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setFlagType('');
    setReason('');
    setError('');
    setSuccess(false);
    onClose();
  };

  const isValid = flagType !== '' && reason.trim().length >= 10;

  return (
    <Modal show={isOpen} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('reportProperty.title')}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {success ? (
          <div>
            <p className="text-success fw-bold mb-0">
              {t('reportProperty.successText')}
            </p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <p className="mb-4 text-muted">
              {t('reportProperty.intro')}
            </p>

            {error && <div className="alert alert-danger p-2 fs-6" role="alert">{error}</div>}

            <Form.Group className="mb-3">
              <Form.Label>{t('reportProperty.typeLabel', { defaultValue: 'Tipo de reporte' })} <span className="text-danger">*</span></Form.Label>
              <Form.Select 
                value={flagType}
                onChange={(e) => setFlagType(e.target.value)}
                disabled={loading}
                required
              >
                <option value="">{t('reportProperty.selectType', { defaultValue: 'Selecciona un tipo...' })}</option>
                <option value="FRAUD">{t('reportProperty.fraud', { defaultValue: 'Fraude' })}</option>
                <option value="ILLEGAL">{t('reportProperty.illegal', { defaultValue: 'Contenido ilegal' })}</option>
                <option value="SPAM">{t('reportProperty.spam', { defaultValue: 'Spam o contenido duplicado' })}</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('reportProperty.reasonLabel', { defaultValue: 'Motivo' })} <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                as="textarea"
                rows={4}
                maxLength={1000}
                placeholder={t('reportProperty.reasonPlaceholder', { defaultValue: 'Describí con detalle por qué estás reportando esta propiedad...' })}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
                required
              />
              <div className="d-flex justify-content-end mt-1">
                <small className={reason.length >= 1000 ? "text-danger" : "text-muted"}>
                  {1000 - reason.length} caracteres restantes
                </small>
              </div>
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={handleClose} disabled={loading}>
                {t('reportProperty.cancel', { defaultValue: 'Cancelar' })}
              </Button>
              <Button type="submit" variant="primary" disabled={!isValid || loading}>
                {loading ? (
                  <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> {t('reportProperty.sending', { defaultValue: 'Enviando...' })}</>
                ) : (
                  t('reportProperty.submit', { defaultValue: 'Enviar reporte' })
                )}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
      
      {success && (
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            {t('reportProperty.close', { defaultValue: 'Cerrar' })}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
}
