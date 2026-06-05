import { Badge, Button } from "react-bootstrap";
import { Eye, ArrowCounterclockwise, Trash3, ClockHistory } from "react-bootstrap-icons";
import PLACEHOLDER_IMAGE from "../../assets/placeholder_img.png";

/**
 * TrashPropertyCard
 * Tarjeta premium para propiedades en la papelera.
 */
export default function TrashPropertyCard({ property, onRestore, onDelete }) {
    const TRASH_DAYS = 10;
    const image = property.primaryImageUrl || property.image || PLACEHOLDER_IMAGE;

    const trashedDate = new Date(property.trashedAt);
    const diffDays = (new Date() - trashedDate) / (1000 * 60 * 60 * 24);
    const daysLeft = Math.ceil(TRASH_DAYS - diffDays);
    const isUrgent = daysLeft <= 3;

    return (
        <div
            className="group h-100 position-relative bg-white"
            style={{
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid #f1f5f9",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
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
                    style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "cover", 
                        filter: "grayscale(40%) opacity(0.8)",
                        transition: "all 0.4s ease" 
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.filter = "grayscale(0%) opacity(1)";
                        e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.filter = "grayscale(40%) opacity(0.8)";
                        e.currentTarget.style.transform = "scale(1)";
                    }}
                    loading="lazy"
                />
                
                <div className="position-absolute top-0 end-0 p-3">
                    <Badge
                        className="border-0 shadow-sm"
                        style={{
                            backgroundColor: isUrgent ? "#ef4444" : "#64748b",
                            borderRadius: "8px",
                            padding: "6px 12px",
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            backdropFilter: "blur(4px)",
                        }}
                    >
                        {daysLeft} {daysLeft === 1 ? "DÍA" : "DÍAS"} RESTANTES
                    </Badge>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 d-flex flex-column h-100">
                <h6 className="fw-bold mb-3 text-center text-truncate" style={{ color: "#0f172a", fontSize: "0.95rem" }}>
                    {property.title}
                </h6>

                <div className="text-center mb-4">
                    <a
                        href={`/properties/${property.id}`}
                        className="text-muted d-inline-flex align-items-center gap-2"
                        style={{ fontSize: "0.8rem", textDecoration: "none", transition: "color 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#3b82f6")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                    >
                        <Eye size={14} />
                        Ver ficha completa
                    </a>
                </div>

                <div className="mt-auto d-flex gap-2">
                    <Button
                        variant="outline-primary"
                        className="flex-fill py-2 d-flex align-items-center justify-content-center gap-2 border-2"
                        style={{ fontSize: "0.8rem", borderRadius: "12px", fontWeight: "700" }}
                        onClick={() => onRestore?.(property)}
                    >
                        <ArrowCounterclockwise size={14} />
                        RESTAURAR
                    </Button>
                    <Button
                        variant="danger"
                        className="flex-fill py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                        style={{ fontSize: "0.8rem", borderRadius: "12px", fontWeight: "700", background: "#ef4444", border: "none" }}
                        onClick={() => onDelete?.(property)}
                    >
                        <Trash3 size={14} />
                        ELIMINAR
                    </Button>
                </div>
            </div>
        </div>
    );
}