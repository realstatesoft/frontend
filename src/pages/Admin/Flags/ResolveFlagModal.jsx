import { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import propertyFlagsApi from '../../../services/propertyFlagsApi';

export default function ResolveFlagModal({ flag, isOpen, onClose, onSuccess }) {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!flag) return null;

  const flagTypeTranslations = {
    FRAUD: 'Fraude',
    ILLEGAL: 'Ilegal',
    SPAM: 'Spam'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) return;

    setLoading(true);
    setError('');

    try {
      await propertyFlagsApi.resolveFlag(flag.id, { resolutionNotes });
      setResolutionNotes('');
      if (onSuccess) onSuccess(flag.id);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Ocurrió un error al resolver el reporte. Por favor, intentá nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResolutionNotes('');
    setError('');
    onClose();
  };

  return (
    <Modal show={isOpen} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Resolver reporte #{flag.id}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div className="mb-4 p-3 bg-light rounded">
          <p className="mb-1"><strong>Propiedad:</strong> #{flag.propertyId}</p>
          <p className="mb-1"><strong>Reportado por:</strong> {flag.reportedByUsername}</p>
          <p className="mb-1"><strong>Tipo de reporte:</strong> {flagTypeTranslations[flag.flagType] || flag.flagType}</p>
          <p className="mb-0 mt-2"><strong>Motivo:</strong></p>
          <p className="text-muted fst-italic mb-0">{flag.reason}</p>
        </div>

        <Form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger p-2 fs-6">{error}</div>}

          <Form.Group className="mb-3">
            <Form.Label>Notas de resolución <span className="text-danger">*</span></Form.Label>
            <Form.Control 
              as="textarea"
              rows={4}
              placeholder="Describí la acción tomada o el motivo por el que se resuelve este reporte..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              disabled={loading}
              required
            />
          </Form.Group>
          
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={!resolutionNotes.trim() || loading}>
              {loading ? (
                <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Procesando...</>
              ) : (
                'Confirmar resolución'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
