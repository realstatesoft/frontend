import { Modal, Button } from "react-bootstrap";

export default function ConfirmDialog({
  show,
  onHide,
  onConfirm,
  title = "Confirmar acción",
  message = "¿Estás seguro?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  loading = false
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {message}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {cancelText}
        </Button>

        <Button
          variant={variant}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Procesando..." : confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}