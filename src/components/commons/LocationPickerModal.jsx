import { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner, Alert, Badge } from "react-bootstrap";
import PropertyMap from "./PropertyMap";
import locationApi from "../../services/locations/locationApi";

// Reverse geocoding usando Nominatim (OpenStreetMap)
// Devuelve datos estructurados además del display_name
async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  return {
    displayName: data.display_name || "",
    city: data.address?.city || data.address?.town || data.address?.village || "",
    department: data.address?.state || "",
    country: data.address?.country || "",
  };
}

/**
 * Modal reutilizable para seleccionar ubicación en el mapa.
 * Auto-detecta la zona (Location) a partir de la ciudad devuelta por Nominatim.
 * Si la ciudad no existe en la BD, la crea automáticamente.
 * Si hay múltiples zonas para una misma ciudad, muestra un selector.
 *
 * Props:
 * - show: boolean
 * - onHide: () => void
 * - initialCoords: { lat, lng } | null
 * - initialAddress: string
 * - initialLocationId: number | null
 * - onConfirm: ({ lat, lng, address, locationId, locationName }) => void
 */
export default function LocationPickerModal({
  show,
  onHide,
  initialCoords,
  initialAddress,
  initialLocationId = null,
  onConfirm,
}) {
  const [coords, setCoords] = useState(initialCoords || null);
  const [address, setAddress] = useState(initialAddress || "");
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [error, setError] = useState(null);

  // Estado para las zonas matcheadas
  const [matchedLocations, setMatchedLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(initialLocationId);
  const [autoCreatedLocation, setAutoCreatedLocation] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(false);

  // Reset al abrir el modal
  useEffect(() => {
    if (!show) return;
    setCoords(initialCoords || null);
    setAddress(initialAddress || "");
    setError(null);
    setLoadingAddress(false);
    setMatchedLocations([]);
    setSelectedLocationId(initialLocationId);
    setAutoCreatedLocation(null);
    setLoadingMatch(false);
  }, [show, initialCoords, initialAddress, initialLocationId]);

  const handleMapChange = async (nextCoords) => {
    setCoords(nextCoords);
    setLoadingAddress(true);
    setLoadingMatch(true);
    setError(null);
    setMatchedLocations([]);
    setSelectedLocationId(null);
    setAutoCreatedLocation(null);

    try {
      const geo = await reverseGeocode(nextCoords.lat, nextCoords.lng);
      setAddress(geo.displayName || "");

      if (geo.city) {
        try {
          // Primero buscar si ya existen locations para esta ciudad
          const { data: matchData } = await locationApi.matchByCity(geo.city);

          if (matchData?.success && matchData?.data?.length > 0) {
            // Ya existen → mostrar opciones
            const locations = matchData.data;
            setMatchedLocations(locations);
            if (locations.length === 1) {
              setSelectedLocationId(locations[0].id);
            }
          } else {
            // No existe → crear automáticamente
            const { data: createData } = await locationApi.findOrCreate(
              geo.city,
              geo.department,
              geo.country
            );
            if (createData?.success && createData?.data) {
              const created = createData.data;
              setAutoCreatedLocation(created);
              setSelectedLocationId(created.id);
              setMatchedLocations([created]);
            }
          }
        } catch {
          // Si falla, no es crítico
          setMatchedLocations([]);
        }
      }
    } catch (e) {
      setError(
        "No se pudo obtener la dirección automáticamente. Podés editarla manualmente."
      );
    } finally {
      setLoadingAddress(false);
      setLoadingMatch(false);
    }
  };

  const handleLocationSelect = (e) => {
    const id = e.target.value ? Number(e.target.value) : null;
    setSelectedLocationId(id);
  };

  const handleConfirm = () => {
    if (!coords) return;
    const selected = matchedLocations.find((l) => l.id === selectedLocationId);
    onConfirm?.({
      lat: coords.lat,
      lng: coords.lng,
      address: address?.trim() || "",
      locationId: selectedLocationId || null,
      locationName: selected?.name || null,
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

        {/* Zona auto-detectada */}
        <Form.Group className="mt-3">
          <Form.Label className="fw-semibold">Zona</Form.Label>
          {loadingMatch ? (
            <div className="small text-muted d-flex align-items-center gap-2">
              <Spinner animation="border" size="sm" /> Buscando zona...
            </div>
          ) : matchedLocations.length > 1 && !autoCreatedLocation ? (
            // Múltiples zonas existentes → dropdown
            <>
              <Form.Select
                value={selectedLocationId || ""}
                onChange={handleLocationSelect}
              >
                <option value="">Seleccioná una zona...</option>
                {matchedLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </Form.Select>
              <div className="mt-1 small text-muted">
                Se encontraron {matchedLocations.length} zonas para esta ciudad.
              </div>
            </>
          ) : matchedLocations.length === 1 ? (
            // Una sola zona (existente o recién creada)
            <div>
              <Badge
                bg={autoCreatedLocation ? "info" : "success"}
                className="fs-6 fw-normal"
              >
                <i className="bi bi-geo-alt-fill me-1" />
                {matchedLocations[0].name}
              </Badge>
              {autoCreatedLocation && (
                <div className="mt-1 small text-muted">
                  <i className="bi bi-plus-circle me-1" />
                  Zona nueva creada automáticamente.
                </div>
              )}
            </div>
          ) : coords ? (
            <div className="small text-muted">
              <i className="bi bi-info-circle me-1" />
              No se pudo detectar la zona para esta ubicación.
            </div>
          ) : null}
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
