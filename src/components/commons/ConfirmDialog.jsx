import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function ConfirmDialog({
  show,
  onHide,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = "danger",
  loading = false,
}) {
  const { t } = useTranslation('common');

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title || t('confirm')}</Modal.Title>
      </Modal.Header>

      <Modal.Body>{message || ''}</Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          {cancelText || t('cancel')}
        </Button>

        <Button variant={variant} onClick={onConfirm} disabled={loading}>
          {loading ? t('processing') : (confirmText || t('confirm'))}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
