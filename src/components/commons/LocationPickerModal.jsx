import { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import PropertyMap from "./PropertyMap";
import { reverseGeocode } from "../../utils/geocoding";

/**
 * Modal reutilizable para seleccionar ubicación en el mapa.
 *
 * Props:
 * - show: boolean
 * - onHide: () => void
 * - initialCoords: { lat, lng } | null
 * - initialAddress: string
 * - onConfirm: ({ lat, lng, address }) => void
 */
export default function LocationPickerModal({
  show,
  onHide,
  initialCoords,
  initialAddress,
  onConfirm,
}) {
  const [coords, setCoords] = useState(initialCoords || null);
  const [address, setAddress] = useState(initialAddress || "");
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [error, setError] = useState(null);

  // Reset al abrir el modal
  useEffect(() => {
    if (!show) return;
    setCoords(initialCoords || null);
    setAddress(initialAddress || "");
    setError(null);
    setLoadingAddress(false);
  }, [show, initialCoords, initialAddress]);

  const handleMapChange = async (nextCoords) => {
    setCoords(nextCoords);
    setLoadingAddress(true);
    setError(null);

    try {
      const addr = await reverseGeocode(nextCoords.lat, nextCoords.lng);
      setAddress(addr || "");
    } catch (e) {
      setError(
        "No se pudo obtener la dirección automáticamente. Podés editarla manualmente."
      );
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleConfirm = () => {
    if (!coords) return;
    onConfirm?.({
      lat: coords.lat,
      lng: coords.lng,
      address: address?.trim() || "",
    });
  };

  const canConfirm = !!coords;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Seleccionar ubicación</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="small text-muted mb-2">
          Hacé clic en el mapa para elegir la ubicación exacta de la propiedad.
        </p>

        <PropertyMap
          value={coords}
          onChange={handleMapChange}
          readOnly={false}
          height={320}
          showCoordinates={true}
        />

        <Form.Group className="mt-3">
          <Form.Label className="fw-semibold">Dirección</Form.Label>
          <Form.Control
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Dirección detectada por el mapa (editable)"
          />
          {loadingAddress && (
            <div className="mt-1 small text-muted d-flex align-items-center gap-2">
              <Spinner animation="border" size="sm" /> Buscando dirección...
            </div>
          )}
        </Form.Group>

        {error && (
          <Alert variant="warning" className="mt-3 py-2 mb-0">
            {error}
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleConfirm} disabled={!canConfirm}>
          Usar esta ubicación
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

