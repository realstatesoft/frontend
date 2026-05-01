import { Alert, Button, Card, Col, Row, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import PLACEHOLDER_IMAGE from "../../assets/placeholder_img.png";
import { PROPERTY_TYPE_LABELS } from "../../constants/propertyEnums";

function formatPrice(price) {
  const numericPrice = Number(price);
  return Number.isFinite(numericPrice) ? `Gs ${numericPrice.toLocaleString()}` : "—";
}

function formatValue(value, suffix = "") {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return `${value}${suffix}`;
}

function CompareColumn({ property, onRemove }) {
  if (!property) {
    return (
      <Card className="h-100 border-2 border-dashed shadow-sm rounded-4">
        <Card.Body className="d-flex flex-column justify-content-center text-center text-muted py-5">
          <div style={{ fontSize: "2rem" }}>+</div>
          <p className="mb-0">Seleccioná otra propiedad para completar la comparación.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
      <Card.Img
        variant="top"
        src={property.primaryImageUrl || PLACEHOLDER_IMAGE}
        alt={property.title || "Image of property"}
        style={{ height: "180px", objectFit: "cover" }}
      />
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
          <div>
            <div className="fw-bold fs-5">{formatPrice(property.price)}</div>
            <div className="text-muted small">
              {PROPERTY_TYPE_LABELS[property.propertyType] ?? property.propertyType ?? "Propiedad"}
            </div>
          </div>
          <Button variant="outline-danger" size="sm" onClick={() => onRemove(property.id)}>
            Quitar
          </Button>
        </div>

        <h5 className="fw-semibold mb-1">{property.title || "Sin título"}</h5>
        <p className="text-muted small mb-3">{property.address || property.locationName || "Ubicación no disponible"}</p>

        <div className="border rounded-4 p-3 bg-light-subtle">
          <div className="d-flex justify-content-between py-1">
            <span className="text-muted">m²</span>
            <strong>{formatValue(property.surfaceArea)}</strong>
          </div>
          <div className="d-flex justify-content-between py-1">
            <span className="text-muted">Baños</span>
            <strong>{formatValue(property.bathrooms)}</strong>
          </div>
          <div className="d-flex justify-content-between py-1">
            <span className="text-muted">Dormitorios</span>
            <strong>{formatValue(property.bedrooms)}</strong>
          </div>
        </div>

        <Button
          as={Link}
          to={`/properties/${property.id}`}
          className="mt-3 rounded-pill"
          style={{ background: "var(--primary, #2563eb)", border: "none" }}
        >
          Ver Detalles
        </Button>
      </Card.Body>
    </Card>
  );
}

export default function PropertyComparePanel({
  properties = [],
  loading,
  error,
  onRemove,
  onClear,
}) {
  const slots = [...properties];
  while (slots.length < 3) {
    slots.push(null);
  }

  return (
    <section className="container pt-4">
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
            <div>
              <div className="text-uppercase text-muted small fw-semibold">Comparador</div>
              <h3 className="mb-1">Compará hasta 3 propiedades lado a lado</h3>
              <p className="text-muted mb-0">
                {properties.length} de 3 seleccionadas en esta sesión.
              </p>
            </div>
            <Button variant="outline-secondary" onClick={onClear}>
              Limpiar comparador
            </Button>
          </div>

          {properties.length === 0 && (
            <Alert variant="info" className="mb-0">
              Todavía no seleccionaste propiedades. Volvé a la lista y elegí hasta 3 para compararlas acá.
            </Alert>
          )}

          {properties.length === 1 && (
            <Alert variant="info">
              Seleccioná al menos una propiedad más para que la comparación tenga sentido.
            </Alert>
          )}

          {loading && properties.length > 0 && (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-3 mb-0">Cargando propiedades para comparar...</p>
            </div>
          )}

          {error && !loading && properties.length > 0 && (
            <Alert variant="warning" className="mb-3">
              {error}
            </Alert>
          )}

          {!loading && properties.length > 0 && (
            <Row className="g-3">
              {slots.map((property, index) => (
                <Col key={property?.id ?? `empty-${index}`} xs={12} md={6} xl={4}>
                  <CompareColumn property={property} onRemove={onRemove} />
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>
    </section>
  );
}
