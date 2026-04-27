import { Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function CompareFloatingBar({
  selectedProperties,
  maxProperties,
  onClear,
}) {
  if (!selectedProperties.length) {
    return null;
  }

  const canCompare = selectedProperties.length >= 2;

  return (
    <div
      className="position-fixed"
      style={{
        right: "1.25rem",
        bottom: "1.25rem",
        zIndex: 1050,
        width: "min(92vw, 360px)",
      }}
    >
      <Card className="border-0 shadow rounded-4 overflow-hidden">
        <Card.Body className="p-3">
          <div className="d-flex align-items-center justify-content-between gap-3">
            <div className="min-w-0">
              <div className="text-uppercase text-muted small fw-semibold">Comparador</div>
              <div className="fw-semibold">
                {selectedProperties.length} de {maxProperties} seleccionadas
              </div>
              {!canCompare && (
                <div className="text-muted small">Seleccioná 1 propiedad más para comparar.</div>
              )}
            </div>
            <div className="d-flex align-items-center gap-2">
              <Button variant="outline-secondary" size="sm" onClick={onClear}>
                Limpiar
              </Button>
              {canCompare && (
                <Button
                  as={Link}
                  to="/properties/compare"
                  variant="primary"
                  size="sm"
                >
                  Comparar
                </Button>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
