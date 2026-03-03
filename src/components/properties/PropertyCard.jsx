import { Card, Badge, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { tagColors } from "../../data/propertiesData";

/**
 * PropertyCard
 * Muestra la tarjeta individual de una propiedad.
 * Props: property { id, tag, price, type, location, bedrooms, bathrooms, area, image }
 */
export default function PropertyCard({ property }) {
    return (
        <Card
            className="h-100 border-0 shadow-sm rounded-4 overflow-hidden"
            style={{ transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "";
            }}
        >
            {/* Imagen con badge de estado */}
            <div className="position-relative">
                <Badge
                    className="position-absolute top-0 start-0 m-2 px-3 py-2"
                    style={{
                        backgroundColor: tagColors[property.tag] ?? "#555",
                        borderRadius: "20px",
                        fontSize: "0.72rem",
                        zIndex: 2,
                    }}
                >
                    {property.tag}
                </Badge>
                <Card.Img
                    variant="top"
                    src={property.image}
                    style={{ height: "195px", objectFit: "cover" }}
                    loading="lazy"
                />
            </div>

            {/* Información principal */}
            <Card.Body className="px-3 py-3">
                <h5 className="fw-bold mb-1" style={{ color: "var(--dark, #1e293b)", fontSize: "1.05rem" }}>
                    Gs {Number(property.price).toLocaleString()}
                </h5>
                <Badge
                    bg="light"
                    text="dark"
                    className="mb-2"
                    style={{ fontSize: "0.7rem", border: "1px solid #ddd" }}
                >
                    {property.type}
                </Badge>
                <p className="text-muted mb-2" style={{ fontSize: "0.82rem" }}>
                    📍 {property.location}
                </p>
                <hr className="my-2" />
                <div className="d-flex justify-content-between text-muted" style={{ fontSize: "0.82rem" }}>
                    <span>🛏 {property.bedrooms} hab.</span>
                    <span>🚿 {property.bathrooms} baños</span>
                    <span>📐 {property.area} m²</span>
                </div>
            </Card.Body>

            {/* Botón de acción */}
            <Card.Footer className="bg-white border-0 pb-3 px-3">
                <Button
                    as={Link}
                    to={`/show-property/${property.id}`}
                    className="w-100 rounded-pill"
                    style={{
                        background: "var(--primary, #2563eb)",
                        border: "none",
                        fontSize: "0.85rem",
                    }}
                >
                    Ver Detalles
                </Button>
            </Card.Footer>
        </Card>
    );
}
