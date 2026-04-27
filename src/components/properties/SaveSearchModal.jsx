import { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { searchPreferencesApi } from "../../services/search/searchPreferencesApi";

export default function SaveSearchModal({
  show,
  onHide,
  filters,
  onSuccess,
}) {
  const [name, setName] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      await searchPreferencesApi.create({
        name: name.trim(),
        filters,
        notificationsEnabled,
      });
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setNotificationsEnabled(false);
    setError(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>💾 Guardar Búsqueda</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre de la búsqueda *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Dptos en Asunción"
              value={name}
              onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
              maxLength={100}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Recibir alertas por email cuando haya nuevas propiedades"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
            />
          </Form.Group>

          {error && <Alert variant="danger">{error}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}