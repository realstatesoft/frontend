import { Card, Badge, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { StarFill } from "react-bootstrap-icons";
import { LuBedDouble, LuBath, LuMaximize, LuMapPin } from "react-icons/lu";
import { tagColors, STATUS_LABELS } from "../../data/propertiesData";
import { PROPERTY_TYPE_LABELS } from "../../constants/propertyEnums";
import PLACEHOLDER_IMAGE from "../../assets/placeholder_img.png";
import FavoriteToggleButton from "./FavoriteToggleButton";
import { useTranslation } from "react-i18next";
import usePropertyPriceDisplay from "../../hooks/usePropertyPriceDisplay";

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
    const price = usePropertyPriceDisplay(property.price);
    // Normalizar campos del API a los que usa el componente
    const tag = t(`card.status.${property.status}`, { defaultValue: property.tag ?? "—" });
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
            className="h-100 border-0 shadow-sm rounded-lg overflow-hidden"
            style={{
                transition: "var(--transition-base, all 0.3s cubic-bezier(0.4, 0, 0.2, 1))",
                cursor: "pointer",
                borderRadius: "var(--radius-lg, 16px)",
                ...(property.highlighted && {
                    outline: "2px solid var(--warning, #f59e0b)",
                    boxShadow: "var(--shadow-lg)",
                }),
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "var(--shadow-lg)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = property.highlighted ? "var(--shadow-lg)" : "var(--shadow-sm)";
            }}
        >
            {/* Imagen con badge de estado y botón favorito */}
            <div className="position-relative">
                <div
                    className="position-absolute top-0 start-0 d-flex flex-wrap gap-1 p-3"
                    style={{
                        zIndex: 2,
                        maxWidth: "calc(100% - 50px)",
                    }}
                >
                    <Badge
                        className="px-3 py-2 border-0"
                        style={{
                            backgroundColor: STATUS_COLORS[property.status] ?? "#555",
                            borderRadius: "var(--radius-xl, 24px)",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                        }}
                    >
                        {tag}
                    </Badge>
                    {property.highlighted && (
                        <Badge
                            className="d-flex align-items-center gap-1 border-0"
                            style={{
                                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                                borderRadius: "var(--radius-xl, 24px)",
                                fontSize: "0.75rem",
                                fontWeight: "600",
                                padding: "6px 12px",
                                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                            }}
                        >
                            <StarFill size={10} aria-hidden="true" /> Destacada
                        </Badge>
                    )}
                </div>
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
                    alt={property?.title || "Imagen de propiedad"}
                    width={400}
                    height={195}
                    style={{ aspectRatio: "16 / 9", objectFit: "cover" }}
                    loading="lazy"
                />
            </div>

            {/* Información principal */}
                <Card.Body className="p-4">
                <h5 className="fw-bold mb-2" style={{ color: "var(--text-dark, #0f172a)", fontSize: "1.125rem", letterSpacing: "-0.01em" }}>
                    {price.label || "—"}
                </h5>
                <Badge
                    bg="light"
                    text="dark"
                    className="mb-3 px-2 py-1 fw-medium"
                    style={{ fontSize: "0.75rem", border: "1px solid var(--border-color-soft, #f1f5f9)", borderRadius: "6px" }}
                >
                    {type}
                </Badge>
                <p className="text-muted mb-3" style={{ fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    <LuMapPin size={16} className="text-primary" style={{ opacity: 0.8 }} /> {location}
                </p>
                <hr className="my-3" style={{ opacity: 0.1 }} />
                <div className="d-flex justify-content-between text-muted fw-medium" style={{ fontSize: "0.85rem" }}>
                    <span className="d-flex align-items-center gap-1">
                        <LuBedDouble size={16} /> {t("card.bedrooms", { count: bedrooms })}
                    </span>
                    <span className="d-flex align-items-center gap-1">
                        <LuBath size={16} /> {t("card.bathrooms", { count: bathrooms })}
                    </span>
                    <span className="d-flex align-items-center gap-1">
                        <LuMaximize size={16} /> {area} m²
                    </span>
                </div>
            </Card.Body>

            {/* Botón de acción */}
            <Card.Footer className="bg-white border-0 pb-4 px-4">
                <div className="d-grid gap-2">
                    <Button
                        as={Link}
                        to={`/properties/${property.id}`}
                        className="w-100 py-2"
                        style={{
                            background: "var(--primary, #2563eb)",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                        }}
                    >
                        {t("card.details")}
                    </Button>
                    <Button
                        variant={isCompared ? "outline-danger" : "outline-primary"}
                        className="w-100 py-2"
                        style={{ fontSize: "0.9rem", borderRadius: "12px", fontWeight: "600" }}
                        disabled={compareDisabled && !isCompared}
                        onClick={() => onToggleCompare?.(property)}
                    >
                        {isCompared ? "Quitar" : "Comparar"}
                    </Button>
                </div>
            </Card.Footer>
        </Card>
    );
}
