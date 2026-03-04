import { Card, Button } from "react-bootstrap";
import { Eye, ArrowCounterclockwise, Trash3 } from "react-bootstrap-icons";

/**
 * TrashPropertyCard
 * Tarjeta de propiedad en la papelera.
 * Props: property { id, title, image, daysLeft }
 *        onRestore(id), onDelete(id)
 */
export default function TrashPropertyCard({ property, onRestore, onDelete }) {
    const isUrgent = property.daysLeft <= 3;

    return (
        <Card
            className="h-100 border-0 shadow-sm rounded-4 overflow-hidden"
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
            {/* Imagen con overlay de "eliminada" */}
            <div className="position-relative">
                <Card.Img
                    variant="top"
                    src={property.image}
                    style={{
                        height: "160px",
                        objectFit: "cover",
                        filter: "grayscale(30%) brightness(0.9)",
                    }}
                    loading="lazy"
                />
               
                <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{ background: "rgba(30,41,59,0.18)" }}
                />
            </div>

            <Card.Body className="px-3 py-3">
                {/* Título */}
                <h6
                    className="fw-semibold mb-3 text-center"
                    style={{ color: "var(--dark, #1e293b)", fontSize: "0.92rem", lineHeight: 1.3 }}
                >
                    {property.title}
                </h6>

                {/* Link ver ficha */}
                <div className="text-center mb-3">
                    <a
                        href={property.link ?? "#"}
                        className="text-muted d-inline-flex align-items-center gap-1"
                        style={{ fontSize: "0.78rem", textDecoration: "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary, #2563eb)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                    >
                        <Eye size={13} />
                        Ver ficha de propiedad
                    </a>
                </div>

                {/* Botones Restaurar / Eliminar */}
                <div className="d-flex gap-2 mb-2">
                    <Button
                        size="sm"
                        variant="outline-primary"
                        className="flex-fill rounded-pill d-flex align-items-center justify-content-center gap-1"
                        style={{ fontSize: "0.8rem", borderColor: "var(--primary, #2563eb)", color: "var(--primary, #2563eb)" }}
                        onClick={() => onRestore?.(property.id)}
                    >
                        <ArrowCounterclockwise size={13} />
                        Restaurar
                    </Button>
                    <Button
                        size="sm"
                        className="flex-fill rounded-pill d-flex align-items-center justify-content-center gap-1"
                        style={{
                            fontSize: "0.8rem",
                            background: "var(--danger, #ef4444)",
                            border: "none",
                        }}
                        onClick={() => onDelete?.(property.id)}
                    >
                        <Trash3 size={13} />
                        Eliminar
                    </Button>
                </div>

                {/* Días restantes */}
                <p
                    className="text-center mb-0"
                    style={{
                        fontSize: "0.75rem",
                        color: isUrgent ? "var(--danger, #ef4444)" : "var(--secondary, #64748b)",
                        fontWeight: isUrgent ? 600 : 400,
                    }}
                >
                    Se eliminará en {property.daysLeft} {property.daysLeft === 1 ? "día" : "días"}
                </p>
            </Card.Body>
        </Card>
    );
}