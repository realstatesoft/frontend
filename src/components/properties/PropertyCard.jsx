import { Card, Badge, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { StarFill } from "react-bootstrap-icons";
import { tagColors, STATUS_LABELS } from "../../data/propertiesData";
import { PROPERTY_TYPE_LABELS } from "../../constants/propertyEnums";
import PLACEHOLDER_IMAGE from "../../assets/placeholder_img.png";
import FavoriteToggleButton from "./FavoriteToggleButton";
import { useTranslation } from "react-i18next";

const STATUS_COLORS = {
    PENDING: "#757575",
    APPROVED: "#1565c0",
    REJECTED: "#c62828",
    PUBLISHED: "#2e7d32",
    SOLD: "#7b1fa2",
    RENTED: "#b39ddb",
    ARCHIVED: "#455a64",
};

/**
 * PropertyCard
 * Muestra la tarjeta individual de una propiedad.
 * Acepta tanto la forma estática vieja como la respuesta del API (PropertySummaryResponse).
 */
export default function PropertyCard({
    property,
    isFavorite = false,
    isFavoriteLoading = false,
    canToggleFavorite = false,
    onToggleFavorite,
    isCompared = false,
    onToggleCompare,
    compareDisabled = false,
}) {
    const { t } = useTranslation("properties");
    // Normalizar campos del API a los que usa el componente
    const tag = t(`card.status.${property.status}`, { defaultValue: property.tag ?? "—" });
    const price = property.price;
    const numericPrice = Number(price);
    const formattedPrice = Number.isFinite(numericPrice)
        ? `Gs ${numericPrice.toLocaleString()}`
        : "—";
    const type = property.propertyType
        ? t(`types.${property.propertyType.toLowerCase()}`, { defaultValue: property.type ?? "" })
        : (property.type ?? "");
    const location = property.address || property.locationName || property.location || "";
    const bedrooms = property.bedrooms ?? "—";
    const bathrooms = property.bathrooms ?? "—";
    const area = property.surfaceArea ?? property.area ?? "—";
    const image = property.primaryImageUrl || property.image || PLACEHOLDER_IMAGE;

    return (
        <Card
            className="h-100 border-0 shadow-sm rounded-4 overflow-hidden"
            style={{
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
                ...(property.highlighted && {
                    outline: "2px solid #f59e0b",
                    boxShadow: "0 0 0 2px #fef3c7",
                }),
            }}
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
                        backgroundColor: STATUS_COLORS[property.status] ?? "#555",
                        borderRadius: "20px",
                        fontSize: "0.72rem",
                        zIndex: 2,
                    }}
                >
                    {tag}
                </Badge>
                {property.highlighted && (
                    <Badge
                        className="position-absolute top-0 end-0 m-2 d-flex align-items-center gap-1"
                        style={{
                            background: "linear-gradient(135deg, #f59e0b, #d97706)",
                            borderRadius: "20px",
                            fontSize: "0.7rem",
                            padding: "5px 10px",
                            zIndex: 2,
                        }}
                    >
                        <StarFill size={10} /> Destacada
                    </Badge>
                )}
                <FavoriteToggleButton
                    isFavorite={isFavorite}
                    loading={isFavoriteLoading}
                    disabled={!canToggleFavorite || !onToggleFavorite}
                    ariaLabel={isFavorite ? t("card.favoriteRemove") : t("card.favoriteAdd")}
                    onClick={() => onToggleFavorite(property.id)}
                />
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
                    <span>🛏 {t("card.bedrooms", { count: bedrooms })}</span>
                    <span>🚿 {t("card.bathrooms", { count: bathrooms })}</span>
                    <span>📐 {area} m²</span>
                </div>
            </Card.Body>

            {/* Botón de acción */}
            <Card.Footer className="bg-white border-0 pb-3 px-3">
                <div className="d-grid gap-2">
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
                        {t("card.details")}
                    </Button>
                    <Button
                        variant={isCompared ? "outline-danger" : "outline-primary"}
                        className="w-100 rounded-pill"
                        style={{ fontSize: "0.85rem" }}
                        disabled={compareDisabled && !isCompared}
                        onClick={() => onToggleCompare?.(property)}
                    >
                        {isCompared ? "Quitar del comparador" : "Comparar"}
                    </Button>
                </div>
            </Card.Footer>
        </Card>
    );
}
