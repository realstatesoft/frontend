import { Card, Badge, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Heart } from "react-bootstrap-icons";
import { tagColors, STATUS_LABELS } from "../../data/propertiesData";
import { PROPERTY_TYPE_LABELS } from "../../constants/propertyEnums";
import PLACEHOLDER_IMAGE from "../../assets/placeholder_img.png";

/**
 * PropertyCard
 * Muestra la tarjeta individual de una propiedad.
 * Acepta tanto la forma estática vieja como la respuesta del API (PropertySummaryResponse).
 */
export default function PropertyCard({ property }) {
    // Normalizar campos del API a los que usa el componente
    const tag = STATUS_LABELS[property.status] ?? property.tag ?? "—";
    const price = property.price;
    const numericPrice = Number(price);
    const formattedPrice = Number.isFinite(numericPrice)
        ? `Gs ${numericPrice.toLocaleString()}`
        : "—";
    const type =
        PROPERTY_TYPE_LABELS[property.propertyType] ?? property.type ?? "";
    const location = property.address || property.locationName || property.location || "";
    const bedrooms = property.bedrooms ?? "—";
    const bathrooms = property.bathrooms ?? "—";
    const area = property.surfaceArea ?? property.area ?? "—";
    const image = property.primaryImageUrl || property.image || PLACEHOLDER_IMAGE;

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
            {/* Imagen con badge de estado y botón favorito */}
            <div className="position-relative">
                <Badge
                    className="position-absolute top-0 start-0 m-2 px-3 py-2"
                    style={{
                        backgroundColor: tagColors[tag] ?? "#555",
                        borderRadius: "20px",
                        fontSize: "0.72rem",
                        zIndex: 2,
                    }}
                >
                    {tag}
                </Badge>
                <button
                    type="button"
                    className="position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center rounded-circle border border-1 border-dark bg-white"
                    style={{
                        width: 36,
                        height: 36,
                        zIndex: 2,
                        cursor: "pointer",
                    }}
                    aria-label="Agregar a favoritos"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // TODO: integrar con API de favoritos
                    }}
                >
                    <Heart size={18} style={{ color: "#333" }} />
                </button>
                <Card.Img
                    variant="top"
                    src={image}
                    style={{ height: "195px", objectFit: "cover" }}
                    loading="lazy"
                />
            </div>

            {/* Información principal */}
            <Card.Body className="px-3 py-3">
                <h5 className="fw-bold mb-1" style={{ color: "var(--dark, #1e293b)", fontSize: "1.05rem" }}>
                    {formattedPrice}
                </h5>
                <Badge
                    bg="light"
                    text="dark"
                    className="mb-2"
                    style={{ fontSize: "0.7rem", border: "1px solid #ddd" }}
                >
                    {type}
                </Badge>
                <p className="text-muted mb-2" style={{ fontSize: "0.82rem" }}>
                    📍 {location}
                </p>
                <hr className="my-2" />
                <div className="d-flex justify-content-between text-muted" style={{ fontSize: "0.82rem" }}>
                    <span>🛏 {bedrooms} hab.</span>
                    <span>🚿 {bathrooms} baños</span>
                    <span>📐 {area} m²</span>
                </div>
            </Card.Body>

            {/* Botón de acción */}
            <Card.Footer className="bg-white border-0 pb-3 px-3">
                <Button
                    as={Link}
                    to={`/properties/${property.id}`}
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
