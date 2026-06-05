import { Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import PLACEHOLDER_IMAGE from "../../../assets/placeholder_img.png";
import usePropertyPriceDisplay from "../../../hooks/usePropertyPriceDisplay";
import "./PropertySummaryCard.scss";

/**
 * PropertySummaryCard
 * Versión compacta y premium de la tarjeta de propiedad.
 */
export default function PropertySummaryCard({ property }) {
    const price = usePropertyPriceDisplay(property.price);
    const image = property.primaryImageUrl || property.image || PLACEHOLDER_IMAGE;

    return (
        <Link to={`/properties/${property.id}`} className="text-decoration-none">
            <div 
                className="group h-100 bg-white"
                style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1px solid #f1f5f9",
                    transition: "all 0.3s ease",
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
                }}
            >
                <div className="position-relative overflow-hidden" style={{ aspectRatio: "1.6" }}>
                    <img
                        src={image}
                        className="w-100 h-100"
                        style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                        alt={property.title}
                        loading="lazy"
                    />
                </div>

                <div className="p-3">
                    <p 
                        className="fw-bold mb-1" 
                        style={{ color: "#2563eb", fontSize: "1rem", letterSpacing: "-0.01em" }}
                    >
                        {price.label || "—"}
                    </p>
                    <p 
                        className="text-truncate mb-0" 
                        style={{ color: "#0f172a", fontSize: "0.85rem", fontWeight: "500" }}
                    >
                        {property.title || "Propiedad"}
                    </p>
                </div>
            </div>
        </Link>
    );
}

