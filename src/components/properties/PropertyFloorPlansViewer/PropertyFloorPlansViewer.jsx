import { useState, useEffect, useCallback } from "react";
import { Spinner, Alert } from "react-bootstrap";
import { FileEarmarkPdf, Image as ImageIcon, ZoomIn, XLg } from "react-bootstrap-icons";
import { usePropertyFloorPlans } from "../../../hooks/usePropertyFloorPlans";
import "./property-floor-plans-viewer.scss";

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Determina el tipo de un archivo a partir de la URL.
 * @returns {"pdf" | "image"}
 */
function resolveFileType(plan) {
  const url = (plan?.url ?? "").toLowerCase().split("?")[0];
  if (url.endsWith(".pdf")) return "pdf";
  return "image";
}

/**
 * Retorna la URL de miniatura del plano.
 */
function getThumbnailUrl(plan) {
  if (resolveFileType(plan) === "pdf") return null;
  return plan.thumbnailUrl || plan.url || null;
}

/**
 * Extrae un nombre legible del plano.
 */
function getPlanLabel(plan, index) {
  if (plan.title) {
    // Quitar extensión para un nombre más limpio
    return plan.title.replace(/\.[^.]+$/, "");
  }
  return `Plano ${index + 1}`;
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

/** Tarjeta de vista previa de un plano */
function PlanPreviewCard({ plan, index, onClick }) {
  const type = resolveFileType(plan);
  const thumbUrl = getThumbnailUrl(plan);
  const label = getPlanLabel(plan, index);

  return (
    <button
      type="button"
      className="floor-plans-viewer__card"
      onClick={onClick}
      aria-label={`Ver plano: ${label}`}
    >
      <div className="floor-plans-viewer__card-preview">
        {type === "pdf" ? (
          <div className="floor-plans-viewer__card-icon">
            <FileEarmarkPdf size={40} color="#dc3545" />
            <span className="floor-plans-viewer__card-ext">PDF</span>
          </div>
        ) : thumbUrl ? (
          <img src={thumbUrl} alt={label} className="floor-plans-viewer__card-img" />
        ) : (
          <div className="floor-plans-viewer__card-icon">
            <ImageIcon size={40} color="#6c757d" />
          </div>
        )}
        <div className="floor-plans-viewer__card-overlay">
          <ZoomIn size={24} />
          <span>Ver plano</span>
        </div>
      </div>
      <div className="floor-plans-viewer__card-footer">
        <span className="floor-plans-viewer__card-label">{label}</span>
        <span className="floor-plans-viewer__card-type">
          {type === "pdf" ? "PDF" : "Imagen"}
        </span>
      </div>
    </button>
  );
}

/** Lightbox de pantalla completa */
function PlanLightbox({ plan, onClose }) {
  const type = resolveFileType(plan);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="floor-plans-viewer__lightbox"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Vista del plano"
    >
      <button
        className="floor-plans-viewer__lightbox-close"
        onClick={onClose}
        aria-label="Cerrar"
        type="button"
      >
        <XLg size={20} />
      </button>

      <div
        className={`floor-plans-viewer__lightbox-content floor-plans-viewer__lightbox-content--${type}`}
        onClick={(e) => e.stopPropagation()}
      >
        {type === "pdf" ? (
          <iframe
            title={plan.title || "Plano PDF"}
            src={plan.url}
            allowFullScreen
            className="floor-plans-viewer__lightbox-pdf"
          />
        ) : (
          <img
            src={plan.url}
            alt={plan.title || "Plano ampliado"}
            className="floor-plans-viewer__lightbox-img"
          />
        )}
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

/**
 * Visor de planos de piso de una propiedad.
 * Muestra tarjetas de vista previa; al hacer clic se abre un lightbox
 * con el visor completo (iframe para PDF, imagen ampliada para imágenes).
 */
export default function PropertyFloorPlansViewer({ propertyId }) {
  const { floorPlans, loading, error } = usePropertyFloorPlans(propertyId);
  const [activePlan, setActivePlan] = useState(null);

  const openPlan = useCallback((plan) => {
    setActivePlan(plan);
  }, []);

  const closePlan = useCallback(() => {
    setActivePlan(null);
  }, []);

  // ── Estado: cargando ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-2">
        <Spinner animation="border" size="sm" variant="primary" />
        <span className="text-muted small">Cargando planos...</span>
      </div>
    );
  }

  // ── Estado: error ────────────────────────────────────────────────────────
  if (error) {
    return (
      <Alert variant="warning" className="mb-0">
        {error}
      </Alert>
    );
  }

  // ── Estado: sin planos ───────────────────────────────────────────────────
  if (floorPlans.length === 0) {
    return (
      <div className="floor-plans-viewer__empty">
        <FileEarmarkPdf size={48} className="floor-plans-viewer__empty-icon" />
        <p className="fw-semibold mb-1">Sin planos disponibles</p>
        <p className="small text-muted mb-0">
          Esta propiedad aún no tiene planos de piso cargados.
        </p>
      </div>
    );
  }

  // ── Vista normal: grilla de tarjetas de previa ───────────────────────────
  return (
    <div className="floor-plans-viewer">
      <div className="floor-plans-viewer__grid">
        {floorPlans.map((plan, idx) => (
          <PlanPreviewCard
            key={plan.id ?? plan.url ?? idx}
            plan={plan}
            index={idx}
            onClick={() => openPlan(plan)}
          />
        ))}
      </div>

      <p className="floor-plans-viewer__hint">
        Clic en un plano para verlo a pantalla completa · Esc para cerrar
      </p>

      {/* Lightbox */}
      {activePlan && (
        <PlanLightbox plan={activePlan} onClose={closePlan} />
      )}
    </div>
  );
}
