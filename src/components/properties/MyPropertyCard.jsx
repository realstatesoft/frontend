import { useState } from "react";
import { Badge, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Eye, EyeSlash, StarFill, Star } from "react-bootstrap-icons";
import { tagColors, STATUS_DISPLAY_LABELS } from "../../data/propertiesData";
import { PROPERTY_TYPE_LABELS } from "../../constants/propertyEnums";
import PLACEHOLDER_IMAGE from "../../assets/placeholder_img.png";
import usePropertyPriceDisplay from "../../hooks/usePropertyPriceDisplay";
import HighlightPropertyModal from "./HighlightPropertyModal";

/**
 * MyPropertyCard
 * Tarjeta de propiedad para la vista "Mis Propiedades".
 */
export default function MyPropertyCard({ property }) {
    const [isHidden, setIsHidden] = useState(false);
    const [showHighlightModal, setShowHighlightModal] = useState(false);
    const navigate = useNavigate();

    const tag = STATUS_DISPLAY_LABELS[property.status] ?? property.status ?? "—";
    const price = usePropertyPriceDisplay(property.price);
    const isRent = property.category === "RENT";
    const priceDisplay = price.label
        ? `${price.label}${isRent ? " Mensual" : ""}`
        : "—";
    const type = PROPERTY_TYPE_LABELS[property.propertyType] ?? property.propertyType ?? "";
    const address = property.address || property.locationName || "";
    const image = property.primaryImageUrl || property.image || PLACEHOLDER_IMAGE;

    const handleCardClick = () => {
        navigate(`/properties/${property.id}`);
    };

    return (
    <>
        <div
            role="button"
            tabIndex={0}
            onClick={handleCardClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick();
                }
            }}
            className="group h-100 position-relative bg-white"
            style={{
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid #f1f5f9",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.1)";
            }}
        >
            {/* Image Section */}
            <div className="position-relative overflow-hidden" style={{ aspectRatio: "1.6" }}>
                <img
                    src={image}
                    alt={property.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    loading="lazy"
                />
                
                <div className="position-absolute top-0 start-0 p-3 d-flex flex-column gap-2">
                    <Badge
                        className="border-0 shadow-sm"
                        style={{
                            backgroundColor: tagColors[tag] ?? "#64748b",
                            borderRadius: "8px",
                            padding: "6px 12px",
                            fontSize: "0.7rem",
                            fontWeight: "700",
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
                            <StarFill size={10} /> Destacada
                        </Badge>
                    )}
                </div>

                <div className="position-absolute top-0 end-0 p-2">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsHidden(!isHidden);
                        }}
                        className="d-flex align-items-center justify-content-center rounded-circle border-0 bg-white shadow-sm"
                        style={{ width: "36px", height: "36px", color: "#64748b" }}
                    >
                        {isHidden ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 d-flex flex-column">
                <div className="mb-1">
                    <span className="text-uppercase fw-bold" style={{ fontSize: "0.65rem", color: "#64748b", letterSpacing: "0.05em" }}>
                        {type}
                    </span>
                </div>
                <h4 className="fw-bold mb-2 text-truncate" style={{ color: "#0f172a", fontSize: "1.1rem" }}>
                    {property.title}
                </h4>
                <div className="mb-3">
                    <h5 className="fw-bold mb-0" style={{ color: "#2563eb", fontSize: "1.15rem" }}>
                        {priceDisplay}
                    </h5>
                </div>
                <div className="d-flex align-items-center gap-1 mb-4 text-muted" style={{ fontSize: "0.85rem" }}>
                    <span className="text-truncate">{address || "Sin dirección"}</span>
                </div>

                <div className="mt-auto">
                    {property.highlighted ? (
                        <div
                            className="p-2 rounded-3 bg-light d-flex align-items-center justify-content-center gap-2 text-warning"
                            style={{ fontSize: "0.75rem", fontWeight: 700 }}
                        >
                            <StarFill size={14} /> 
                            <span>
                                {(() => {
                                    if (!property.highlightedUntil) return "DESTACADA";
                                    const d = new Date(property.highlightedUntil);
                                    return isNaN(d.getTime()) ? "DESTACADA" : `HASTA ${d.toLocaleDateString()}`;
                                })()}
                            </span>
                        </div>
                    ) : (
                        <Button
                            variant="outline-warning"
                            className="w-100 py-2 border-2 fw-bold"
                            style={{ borderRadius: "12px", fontSize: "0.8rem" }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowHighlightModal(true);
                            }}
                        >
                            <Star size={14} className="me-1" /> DESTACAR PROPIEDAD
                        </Button>
                    )}
                </div>
            </div>
        </div>

        <HighlightPropertyModal
            property={property}
            show={showHighlightModal}
            onHide={() => setShowHighlightModal(false)}
        />
    </>
    );
}
