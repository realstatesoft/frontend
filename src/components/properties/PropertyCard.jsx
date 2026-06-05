import { Badge, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { StarFill, PlusSquare, DashSquare } from "react-bootstrap-icons";
import { LuBedDouble, LuBath, LuMaximize, LuMapPin } from "react-icons/lu";
import PLACEHOLDER_IMAGE from "../../assets/placeholder_img.png";
import FavoriteToggleButton from "./FavoriteToggleButton";
import { useTranslation } from "react-i18next";
import usePropertyPriceDisplay from "../../hooks/usePropertyPriceDisplay";

const STATUS_COLORS = {
    PENDING: "#64748b",
    APPROVED: "#3b82f6",
    REJECTED: "#ef4444",
    PUBLISHED: "#10b981",
    SOLD: "#8b5cf6",
    RENTED: "#a855f7",
    ARCHIVED: "#475569",
};

/**
 * PropertyCard
 * Tarjeta premium para mostrar propiedades.
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
    const navigate = useNavigate();
    const price = usePropertyPriceDisplay(property.price);
    
    const tag = t(`card.status.${property.status}`, { defaultValue: property.tag ?? "—" });
    const type = property.propertyType
        ? t(`types.${property.propertyType.toLowerCase()}`, { defaultValue: property.type ?? "" })
        : (property.type ?? "");
    const location = property.address || property.locationName || property.location || "";
    const bedrooms = property.bedrooms ?? 0;
    const bathrooms = property.bathrooms ?? 0;
    const area = property.surfaceArea ?? property.area ?? 0;
    const image = property.primaryImageUrl || property.image || PLACEHOLDER_IMAGE;

    const handleCardClick = () => {
        navigate(`/properties/${property.id}`);
    };

    const handleCompareClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleCompare?.(property);
    };

    return (
        <div
            className="group h-100 position-relative bg-white"
            onClick={handleCardClick}
            style={{
                borderRadius: "20px",
                overflow: "hidden",
                border: property.highlighted ? "2px solid #f59e0b" : "1px solid #f1f5f9",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                boxShadow: property.highlighted 
                    ? "0 20px 25px -5px rgba(245, 158, 11, 0.1), 0 10px 10px -5px rgba(245, 158, 11, 0.04)"
                    : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = property.highlighted 
                    ? "0 20px 25px -5px rgba(245, 158, 11, 0.1), 0 10px 10px -5px rgba(245, 158, 11, 0.04)"
                    : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
            }}
        >
            {/* Image Section */}
            <div className="position-relative overflow-hidden" style={{ aspectRatio: "1.5" }}>
                <img
                    src={image}
                    alt={property?.title || "Propiedad"}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    loading="lazy"
                />
                
                {/* Overlay Gradients */}
                <div className="position-absolute bottom-0 start-0 w-100 h-50" 
                     style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)", pointerEvents: "none" }} />

                {/* Status & Highlights */}
                <div className="position-absolute top-0 start-0 p-3 d-flex flex-column gap-2">
                    <Badge
                        className="border-0 shadow-sm"
                        style={{
                            backgroundColor: STATUS_COLORS[property.status] ?? "#64748b",
                            borderRadius: "8px",
                            padding: "6px 12px",
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            letterSpacing: "0.02em",
                            textTransform: "uppercase",
                            backdropFilter: "blur(4px)",
                        }}
                    >
                        {tag}
                    </Badge>
                    {property.highlighted && (
                        <Badge
                            className="d-flex align-items-center gap-1 border-0 shadow-sm"
                            style={{
                                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                                borderRadius: "8px",
                                padding: "6px 12px",
                                fontSize: "0.7rem",
                                fontWeight: "700",
                                textTransform: "uppercase",
                            }}
                        >
                            <StarFill size={10} /> {t("card.highlighted", { defaultValue: "Destacada" })}
                        </Badge>
                    )}
                </div>

                {/* Actions: Favorite & Compare */}
                <div className="position-absolute top-0 end-0 p-2 d-flex flex-column gap-2">
                    <FavoriteToggleButton
                        isFavorite={isFavorite}
                        loading={isFavoriteLoading}
                        disabled={!canToggleFavorite || !onToggleFavorite}
                        onClick={() => onToggleFavorite(property.id)}
                    />
                    
                    <button
                        onClick={handleCompareClick}
                        disabled={compareDisabled && !isCompared}
                        className="d-flex align-items-center justify-content-center rounded-circle border-0 bg-white shadow-sm"
                        style={{
                            width: "36px",
                            height: "36px",
                            color: isCompared ? "#3b82f6" : "#64748b",
                            transition: "all 0.2s",
                            opacity: (compareDisabled && !isCompared) ? 0.5 : 1,
                        }}
                        title={isCompared ? t("card.compareRemove") : t("card.compareAdd")}
                    >
                        {isCompared ? <DashSquare size={18} /> : <PlusSquare size={18} />}
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4">
                <div className="mb-1">
                    <span 
                        className="text-uppercase fw-bold" 
                        style={{ fontSize: "0.65rem", color: "#64748b", letterSpacing: "0.05em" }}
                    >
                        {type}
                    </span>
                </div>
                
                <h4 
                    className="fw-bold mb-2 text-truncate" 
                    style={{ color: "#0f172a", fontSize: "1.25rem" }}
                    title={price.label || ""}
                >
                    {price.label || "—"}
                </h4>

                <div className="d-flex align-items-start gap-1 mb-4 text-muted" style={{ fontSize: "0.875rem", minHeight: "2.6em" }}>
                    <LuMapPin size={16} className="text-primary flex-shrink-0 mt-1" style={{ opacity: 0.7 }} />
                    <span style={{ 
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: "1.3",
                    }}>
                        {location}
                    </span>
                </div>

                <div className="pt-3 border-top" style={{ borderColor: "#f1f5f9" }}>
                    <div className="d-flex justify-content-between text-muted">
                        <div className="d-flex align-items-center gap-2">
                            <LuBedDouble size={18} style={{ color: "#94a3b8" }} />
                            <span className="fw-semibold" style={{ color: "#334155", fontSize: "0.9rem" }}>{bedrooms}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <LuBath size={18} style={{ color: "#94a3b8" }} />
                            <span className="fw-semibold" style={{ color: "#334155", fontSize: "0.9rem" }}>{bathrooms}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <LuMaximize size={18} style={{ color: "#94a3b8" }} />
                            <span className="fw-semibold" style={{ color: "#334155", fontSize: "0.9rem" }}>{area} m²</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

