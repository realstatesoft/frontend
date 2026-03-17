import { Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { HeartFill, Share } from "react-bootstrap-icons";
import { FAVORITE_STATUS_LABELS, FAVORITE_BADGE_STYLES } from "../../data/propertiesData";
import PLACEHOLDER_IMAGE from "../../assets/placeholder_img.png";

/**
 * FavoritePropertyCard
 * Tarjeta de propiedad para la vista "Propiedades Favoritas".
 * Muestra info del agente, fecha agregada y botón de corazón (favorito).
 */
export default function FavoritePropertyCard({ property }) {
  const tag = FAVORITE_STATUS_LABELS[property.status] ?? property.tag ?? "—";
  const numericPrice = Number(property.price);
  const formattedPrice = Number.isFinite(numericPrice)
    ? `Gs. ${numericPrice.toLocaleString()}`
    : "—";
  const address = property.address || property.locationName || property.location || "";
  const bedrooms = property.bedrooms ?? "—";
  const bathrooms = property.bathrooms ?? "—";
  const area = property.surfaceArea ?? property.area ?? "—";
  const image = property.primaryImageUrl || property.image || PLACEHOLDER_IMAGE;
  const agentName = property.agentName ?? "—";
  const agentPhone = property.agentPhone ?? "—";
  const dateAdded = property.dateAdded ?? "—";

  return (
    <Card
      className="h-100 border-0 shadow-sm rounded-3 overflow-hidden"
      style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {/* Imagen con badge de estado y corazón */}
      <div className="position-relative">
        <span
          className="position-absolute top-0 start-0 m-2 px-3 py-1"
          style={{
            backgroundColor: FAVORITE_BADGE_STYLES[tag]?.bg ?? "#eceff1",
            color: FAVORITE_BADGE_STYLES[tag]?.text ?? "#455a64",
            borderRadius: "999px",
            fontSize: "0.8rem",
            fontWeight: 500,
            zIndex: 2,
          }}
        >
          {tag}
        </span>
        <button
          type="button"
          className="position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center rounded-circle border border-1 border-dark bg-white"
          style={{
            width: 36,
            height: 36,
            zIndex: 2,
            cursor: "pointer",
          }}
          aria-label="Quitar de favoritos"
          onClick={(e) => e.preventDefault()}
        >
          <HeartFill size={18} style={{ color: "#dc3545" }} />
        </button>
        <Card.Img
          variant="top"
          src={image}
          style={{ height: "200px", objectFit: "cover" }}
          loading="lazy"
        />
      </div>

      <Card.Body className="px-3 py-3">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
          <h6
            className="fw-bold mb-0"
            style={{ color: "var(--dark, #1e293b)", fontSize: "1rem", lineHeight: 1.3 }}
          >
            {property.title}
          </h6>
          <span
            className="fw-bold flex-shrink-0"
            style={{ color: "var(--primary, #2563eb)", fontSize: "1rem" }}
          >
            {formattedPrice}
          </span>
        </div>
        <p className="text-muted mb-2" style={{ fontSize: "0.82rem" }}>
          📍 {address}
        </p>
        <div className="d-flex gap-3 text-muted mb-3" style={{ fontSize: "0.82rem" }}>
          <span>{bedrooms} hab</span>
          <span>{bathrooms} baños</span>
          <span>{area} m²</span>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <p className="mb-0 fw-semibold" style={{ fontSize: "0.75rem", color: "#666" }}>
              Agente
            </p>
            <p className="mb-0" style={{ fontSize: "0.85rem" }}>{agentName}</p>
            <p className="mb-0 text-muted" style={{ fontSize: "0.78rem" }}>{agentPhone}</p>
          </div>
          <div className="text-end">
            <p className="mb-0" style={{ fontSize: "0.75rem", color: "#666" }}>
              Agregado el
            </p>
            <p className="mb-0" style={{ fontSize: "0.85rem" }}>{dateAdded}</p>
          </div>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <Button
            as={Link}
            to={`/properties/${property.id}`}
            className="flex-grow-1 rounded-2"
            style={{
              background: "var(--primary, #2563eb)",
              border: "none",
              fontSize: "0.85rem",
            }}
          >
            Ver Detalles
          </Button>
          <Button
            variant="outline-secondary"
            className="rounded-2 p-2"
            style={{ minWidth: 40 }}
            aria-label="Compartir"
          >
            <Share size={18} />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
