import { useState, useRef } from "react";
import {
  IoDocumentTextOutline,
  IoCloudUploadOutline,
  IoTrashOutline,
  IoEyeOutline,
  IoWarningOutline,
  IoImageOutline,
} from "react-icons/io5";
import { FormSectionTitle } from "../../../components/properties/FormComponents";

// ─── Constantes ──────────────────────────────────────────────────────────────

const ACCEPTED_TYPES    = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const ACCEPTED_EXTS     = ".pdf,.jpg,.jpeg,.png,.webp";
const MAX_SIZE_MB        = 10;
const MAX_SIZE_BYTES     = MAX_SIZE_MB * 1024 * 1024;
const MAX_PLANS          = 5;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function validateFile(f) {
  const ext = "." + (f.name?.split(".").pop()?.toLowerCase() ?? "");
  const allowedExts = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
  if (!ACCEPTED_TYPES.includes(f.type) && !allowedExts.includes(ext))
    return "Formato no válido. Usar: PDF, JPG, PNG o WebP.";
  if (f.size > MAX_SIZE_BYTES)
    return `El archivo supera el límite de ${MAX_SIZE_MB} MB.`;
  return null;
}

function isPdf(title) {
  return title?.toLowerCase().endsWith(".pdf");
}

// ─── Botón de subida ─────────────────────────────────────────────────

function UploadButton({ onFile, disabled }) {
  const [localError, setLocalError] = useState(null);
  const inputRef = useRef(null);

  function handleChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const err = validateFile(f);
    if (err) { setLocalError(err); return; }
    setLocalError(null);
    onFile(f);
    e.target.value = "";
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTS}
        className="d-none"
        onChange={handleChange}
        disabled={disabled}
      />
      <button
        type="button"
        className="doc-section__add-btn"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        <IoCloudUploadOutline size={18} />
        {disabled ? "Subiendo plano..." : "Subir plano"}
      </button>
      {localError && (
        <div className="doc-error mt-2">
          <IoWarningOutline size={16} /> {localError}
        </div>
      )}
    </div>
  );
}

// ─── Tarjeta de plano ─────────────────────────────────────────────────────────

function FloorPlanCard({ plan, index, onRemove }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="doc-card" style={{ borderLeft: "3px solid #6c63ff" }}>
      <div className="doc-card__main">
        <div className="doc-card__icon">
          {isPdf(plan.title) ? (
            <IoDocumentTextOutline size={24} style={{ color: "#e74c3c" }} />
          ) : (
            <IoImageOutline size={24} style={{ color: "#6c63ff" }} />
          )}
        </div>
        <div className="doc-card__content">
          <div className="doc-card__type" style={{ fontWeight: 600, fontSize: 13 }}>
            Plano {index + 1}
          </div>
          <div className="doc-card__name">
            {plan.title?.split("/").pop() || `plano-${index + 1}`}
          </div>
          {plan.size && (
            <div className="doc-card__stats">{formatSize(plan.size)}</div>
          )}
        </div>
      </div>

      <div className="doc-card__side" style={{ gap: 8 }}>
        {plan.url && (
          <a
            href={plan.url}
            target="_blank"
            rel="noreferrer"
            className="doc-action-btn doc-action-btn--view"
            title="Ver plano"
          >
            <IoEyeOutline size={18} />
          </a>
        )}

        {!confirmDelete ? (
          <button
            type="button"
            className="doc-action-btn doc-action-btn--delete"
            title="Eliminar plano"
            onClick={() => setConfirmDelete(true)}
          >
            <IoTrashOutline size={18} />
          </button>
        ) : (
          <div className="doc-card__confirm">
            <span className="small text-muted me-1">¿Eliminar?</span>
            <button
              type="button"
              className="doc-btn doc-btn--danger-sm me-1"
              onClick={() => { onRemove(index); setConfirmDelete(false); }}
            >
              Sí
            </button>
            <button
              type="button"
              className="doc-btn doc-btn--ghost-sm"
              onClick={() => setConfirmDelete(false)}
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────

/**
 * Sección para subir, listar y eliminar planos de una propiedad.
 *
 * @param {Array}    floorPlans        - array de planos del estado del formulario
 * @param {Function} addFloorPlan      - función del hook para agregar un plano
 * @param {Function} removeFloorPlan   - función del hook para eliminar un plano por índice
 * @param {boolean}  uploadingFloorPlan - true mientras se está subiendo un archivo
 */
export default function FloorPlanSection({
  floorPlans = [],
  addFloorPlan,
  removeFloorPlan,
  uploadingFloorPlan = false,
}) {
  const atLimit = floorPlans.length >= MAX_PLANS;

  return (
    <div className="mb-4">
      <FormSectionTitle title="Planos de la propiedad" />

      <p className="text-muted mb-3" style={{ fontSize: 13 }}>
        Podés subir hasta {MAX_PLANS} planos en formato PDF, JPG o PNG.
        Se asociarán automáticamente a la propiedad.
      </p>

      {/* Listado de planos ya cargados */}
      {floorPlans.length > 0 && (
        <div className="doc-list mb-3">
          {floorPlans.map((plan, i) => (
            <FloorPlanCard
              key={plan.url ?? i}
              plan={plan}
              index={i}
              onRemove={removeFloorPlan}
            />
          ))}
        </div>
      )}

      {/* Botón de subida: oculto si se alcanzó el límite */}
      {!atLimit && (
        <UploadButton onFile={addFloorPlan} disabled={uploadingFloorPlan} />
      )}

      {atLimit && (
        <div className="doc-error" style={{ background: "#fff8e1", borderColor: "#f59e0b", color: "#92400e" }}>
          <IoWarningOutline size={16} />
          Alcanzaste el límite de {MAX_PLANS} planos. Eliminá uno para agregar otro.
        </div>
      )}
    </div>
  );
}
