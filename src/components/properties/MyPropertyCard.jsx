import { useState } from "react";
import { Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { tagColors, STATUS_DISPLAY_LABELS } from "../../data/propertiesData";
import { PROPERTY_TYPE_LABELS } from "../../constants/propertyEnums";
import PLACEHOLDER_IMAGE from "../../assets/placeholder_img.png";

/**
 * MyPropertyCard
 * Tarjeta de propiedad para la vista "Mis Propiedades".
 */
export default function MyPropertyCard({ property }) {
    const [isHidden, setIsHidden] = useState(false);

    const tag = STATUS_DISPLAY_LABELS[property.status] ?? property.status ?? "—";
    const numericPrice = Number(property.price);
    const formattedPrice = Number.isFinite(numericPrice)
        ? `Gs. ${numericPrice.toLocaleString()}`
        : "—";
    const isRent = property.category === "RENT";
    const priceDisplay = isRent ? `${formattedPrice} Mensual` : formattedPrice;
    const type = PROPERTY_TYPE_LABELS[property.propertyType] ?? property.propertyType ?? "";
    const address = property.address || property.locationName || "";
    const image = property.primaryImageUrl || property.image || PLACEHOLDER_IMAGE;

    return (
        <Card
            as={Link}
            to={`/properties/${property.id}`}
            className="h-100 border-0 shadow-sm rounded-4 overflow-hidden text-decoration-none"
            style={{
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
                color: "inherit",
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
            <Card.Body className="p-4 d-flex flex-column align-items-center">
                {/* Badge de estado */}
                <div className="w-100 d-flex justify-content-start mb-2">
                    <Badge
                        style={{
                            backgroundColor: tagColors[tag] ?? "#555",
                            borderRadius: "20px",
                            fontSize: "0.72rem",
                            padding: "6px 12px",
                        }}
                    >
                        {tag}
                    </Badge>
                </div>

                {/* Título + icono ojo (futuro: ocultar propiedad de clientes) */}
                <div className="w-100 d-flex align-items-center justify-content-between gap-2 mb-3">
                    <h6
                        className="fw-bold mb-0 text-truncate"
                        style={{ color: "var(--dark, #1e293b)", fontSize: "1rem", lineHeight: 1.3 }}
                    >
                        {property.title}
                    </h6>
                    {isHidden ? (
                        <EyeSlash
                            size={18}
                            className="text-muted flex-shrink-0"
                            style={{ cursor: "pointer", opacity: 0.7 }}
                            title="Mostrar a clientes"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsHidden(false);
                            }}
                        />
                    ) : (
                        <Eye
                            size={18}
                            className="text-muted flex-shrink-0"
                            style={{ cursor: "pointer", opacity: 0.7 }}
                            title="Ocultar de clientes"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsHidden(true);
                            }}
                        />
                    )}
                </div>
                
                {/* Imagen */}
                <div
                    className="rounded-3 mb-3 overflow-hidden"
                    style={{
                        width: "100%",
                        maxWidth: "200px",
                        aspectRatio: "4/3",
                        flexShrink: 0,
                    }}
                >
                    <img
                        src={image}
                        alt={property.title}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                        loading="lazy"
                    />
                </div>

                {/* Precio */}
                <h5
                    className="fw-bold mb-2 text-center"
                    style={{ color: "var(--dark, #1e293b)", fontSize: "1.1rem" }}
                >
                    {priceDisplay}
                </h5>

                {/* Tipo (texto) */}
                <p
                    className="mb-2 text-center"
                    style={{ color: "var(--dark, #1e293b)", fontSize: "0.9rem" }}
                >
                    {type}
                </p>

                {/* Dirección */}
                <p
                    className="text-muted mb-0 text-center"
                    style={{ fontSize: "0.82rem", lineHeight: 1.3 }}
                >
                    {address || "—"}
                </p>
            </Card.Body>
        </Card>
    );
}
