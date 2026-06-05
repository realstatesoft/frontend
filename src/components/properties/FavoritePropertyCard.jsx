import { Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Share, Calendar3, PersonBadge } from "react-bootstrap-icons";
import { LuBedDouble, LuBath, LuMaximize, LuMapPin } from "react-icons/lu";
import { FAVORITE_STATUS_LABELS, FAVORITE_BADGE_STYLES } from "../../data/propertiesData";
import PLACEHOLDER_IMAGE from "../../assets/placeholder_img.png";
import FavoriteToggleButton from "./FavoriteToggleButton";
import usePropertyPriceDisplay from "../../hooks/usePropertyPriceDisplay";

/**
 * FavoritePropertyCard
 * Tarjeta premium para la vista de favoritos.
 */
export default function FavoritePropertyCard({
  property,
  onRemoveFavorite,
  removing = false,
}) {

  const navigate = useNavigate();
  const tag = FAVORITE_STATUS_LABELS[property.status] ?? property.tag ?? "—";
  const price = usePropertyPriceDisplay(property.price);
  const address = property.address || property.locationName || property.location || "";
  const bedrooms = property.bedrooms ?? 0;
  const bathrooms = property.bathrooms ?? 0;
  const area = property.surfaceArea ?? property.area ?? 0;
  const image = property.primaryImageUrl || property.image || PLACEHOLDER_IMAGE;
  const agentName = property.agentName ?? "—";
  const dateAdded = property.dateAdded ?? "—";

  const handleCardClick = () => {
    navigate(`/properties/${property.id}`);
  };



  return (
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
      <div className="position-relative overflow-hidden" style={{ aspectRatio: "1.5" }}>
        <img
          src={image}
          alt={property?.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          loading="lazy"
        />
        
        <div className="position-absolute top-0 start-0 p-3">
          <Badge
            className="border-0 shadow-sm"
            style={{
              backgroundColor: FAVORITE_BADGE_STYLES[tag]?.bg ?? "#64748b",
              color: "#fff",
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
        </div>

        <FavoriteToggleButton
          isFavorite
          loading={removing}
          disabled={!onRemoveFavorite}
          onClick={() => onRemoveFavorite(property.id)}
        />
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h4 className="fw-bold mb-0" style={{ color: "#0f172a", fontSize: "1.15rem" }}>
            {price.label || "—"}
          </h4>
          <span
            aria-hidden="true"
            className="text-muted"
            style={{ lineHeight: 0 }}
          >
            <Share size={18} />
          </span>
        </div>

        <div className="d-flex align-items-center gap-1 mb-3 text-muted" style={{ fontSize: "0.85rem" }}>
          <LuMapPin size={16} className="text-primary flex-shrink-0" style={{ opacity: 0.7 }} />
          <span className="text-truncate">{address}</span>
        </div>

        <div className="d-flex justify-content-between text-muted mb-4" style={{ fontSize: "0.85rem" }}>
          <span className="d-flex align-items-center gap-1"><LuBedDouble size={16} /> {bedrooms}</span>
          <span className="d-flex align-items-center gap-1"><LuBath size={16} /> {bathrooms}</span>
          <span className="d-flex align-items-center gap-1"><LuMaximize size={16} /> {area} m²</span>
        </div>

        {/* Agent & Info Footer */}
        <div className="pt-3 border-top d-flex justify-content-between align-items-center" style={{ borderColor: "#f1f5f9" }}>
          <div className="d-flex align-items-center gap-2">
            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
              <PersonBadge size={16} className="text-muted" />
            </div>
            <div>
              <p className="mb-0 fw-bold" style={{ fontSize: "0.75rem", color: "#334155" }}>{agentName}</p>
              <p className="mb-0 text-muted" style={{ fontSize: "0.65rem" }}>Agente</p>
            </div>
          </div>
          <div className="text-end">
            <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "0.7rem" }}>
              <Calendar3 size={12} />
              <span>{dateAdded}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

