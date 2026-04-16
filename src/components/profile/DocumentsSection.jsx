import { useState, useEffect, useRef, useCallback } from "react";
import Swal from "sweetalert2";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  getMyDocuments,
  uploadDocument,
  replaceDocument,
  deleteDocument,
} from "../../services/documents/documentService";
import {
  IoDocumentTextOutline,
  IoCloudUploadOutline,
  IoTrashOutline,
  IoRefreshOutline,
  IoEyeOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoCloseCircleOutline,
  IoAddOutline,
  IoWarningOutline,
  IoFileTrayFullOutline,
  IoArrowForwardOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";

// ─── Constantes ───────────────────────────────────────────────────────────────

// Documentos KYC obligatorios para verificar el perfil en Paraguay
const KYC_REQUIRED_TYPES = [
  {
    value: "ID_FRONT",
    label: "Cédula de Identidad — Frente",
    description: "Fotografiá el frente de tu CI. Tu nombre, número y foto deben ser claramente visibles.",
    tip: "Buena iluminación, sin reflejos ni bordes cortados.",
    accept: "Foto o PDF",
  },
  {
    value: "ID_BACK",
    label: "Cédula de Identidad — Reverso",
    description: "Fotografiá el dorso de tu CI. El código de barras debe ser legible.",
    tip: "Evitá sombras sobre el código de barras.",
    accept: "Foto o PDF",
  },
  {
    value: "SELFIE",
    label: "Foto de tu rostro (Selfie)",
    description: "Subí una foto reciente de tu cara mirando de frente. Sin anteojos de sol ni accesorios que cubran el rostro.",
    tip: "Fondo claro y buena iluminación. Sosté la cámara a la altura de los ojos.",
    accept: "Solo foto (JPG, PNG)",
  },
  {
    value: "PROOF_OF_ADDRESS",
    label: "Comprobante de Domicilio",
    description: "Subí una factura de servicios (luz, agua, gas) o un certificado de residencia con fecha de los últimos 3 meses.",
    tip: "Tu nombre completo, dirección y fecha deben ser legibles.",
    accept: "Foto o PDF",
  },
];

// Documentos adicionales opcionales
const OPTIONAL_DOCUMENT_TYPES = [
  { value: "PROOF_OF_INCOME", label: "Comprobante de Ingresos" },
  { value: "TAX_RETURN",      label: "Declaración de Impuestos" },
  { value: "BANK_STATEMENT",  label: "Extracto Bancario" },
  { value: "OTHER",           label: "Otro" },
];

const DOCUMENT_TYPES = [...KYC_REQUIRED_TYPES, ...OPTIONAL_DOCUMENT_TYPES];
const KYC_TYPE_VALUES = new Set(KYC_REQUIRED_TYPES.map(t => t.value));

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.webp";
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDocTypeLabel(value) {
  return DOCUMENT_TYPES.find((t) => t.value === value)?.label ?? value;
}

function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function validateFile(f) {
  if (!ACCEPTED_TYPES.includes(f.type)) return "Formato no válido. Usar: JPG, PNG o PDF.";
  if (f.size > MAX_SIZE_BYTES) return `El archivo es muy pesado. Máximo ${MAX_SIZE_MB}MB.`;
  return null;
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = {
    PENDING:  { icon: <IoTimeOutline />,             label: "Pendiente", desc: "Revisión estimada: 24–48 hs",  cls: "doc-badge--pending" },
    APPROVED: { icon: <IoCheckmarkCircleOutline />,  label: "Aprobado",  desc: "Validado correctamente",       cls: "doc-badge--approved" },
    REJECTED: { icon: <IoCloseCircleOutline />,      label: "Rechazado", desc: "Requiere acción",              cls: "doc-badge--rejected" },
  };
  const { icon, label, desc, cls } = cfg[status] ?? cfg.PENDING;
  return (
    <div className="doc-badge-group">
      <span className={`doc-badge ${cls}`}>{icon}{label}</span>
      <span className="doc-badge-desc">{desc}</span>
    </div>
  );
}

// ─── DropZone ────────────────────────────────────────────────────────────────

function DropZone({ file, onFile, onClear }) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  }

  if (file) {
    return (
      <div className="doc-file-preview">
        <div className="doc-file-preview__info">
          <div className="doc-file-preview__icon"><IoDocumentTextOutline size={28} /></div>
          <div className="doc-file-preview__details">
            <div className="doc-file-preview__name">{file.name}</div>
            <div className="doc-file-preview__size">{formatSize(file.size)}</div>
          </div>
          <button type="button" className="doc-file-preview__remove" onClick={onClear} title="Cambiar archivo">
            <IoRefreshOutline size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`doc-dropzone ${dragOver ? "doc-dropzone--active" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className="d-none"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      <div className="doc-dropzone__hint">
        <div className="doc-dropzone__icon-circle"><IoCloudUploadOutline size={32} /></div>
        <p className="doc-dropzone__text">
          <span>Arrastrá tu archivo aquí</span> o hacé click para seleccionar
        </p>
        <div className="doc-dropzone__validations">
          <span>JPG, PNG o PDF</span>
          <span className="dot">•</span>
          <span>Máx. {MAX_SIZE_MB}MB</span>
        </div>
      </div>
    </div>
  );
}

// ─── KYC Wizard Modal ─────────────────────────────────────────────────────────

function KYCWizardModal({ onClose, onDocUploaded, existingDocs }) {
  // ⚠️ Se calcula UNA SOLA VEZ al abrir el modal (lazy init).
  // Si se recalculara en cada render, cuando existingDocs cambie después de
  // subir un doc, stepIndex apuntaría al paso incorrecto o fuera de rango.
  const [pendingSteps] = useState(() =>
    KYC_REQUIRED_TYPES.filter(req =>
      !existingDocs.some(d => d.documentType === req.value && d.documentStatus !== "REJECTED")
    )
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Si no hay pasos pendientes
  if (pendingSteps.length === 0) {
    return (
      <div className="doc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
        <div className="doc-modal" style={{ maxWidth: 480, textAlign: "center", padding: "48px 40px" }}>
          <IoShieldCheckmarkOutline size={56} style={{ color: "var(--color-success, #198754)", marginBottom: 16 }} />
          <h5 className="fw-bold mb-2">¡Todo listo!</h5>
          <p className="text-muted mb-4">Ya subiste todos los documentos requeridos. Nuestro equipo los revisará en 24–48 hs.</p>
          <button className="doc-btn doc-btn--primary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    );
  }

  const currentStep = pendingSteps[stepIndex];
  const isLastStep = stepIndex === pendingSteps.length - 1;
  const totalSteps = pendingSteps.length;
  const progressPct = ((stepIndex) / totalSteps) * 100;

  function handleFileSelected(f) {
    const err = validateFile(f);
    if (err) { setError(err); setFile(null); }
    else { setError(null); setFile(f); }
  }

  async function handleNext(e) {
    e.preventDefault();
    if (!file) { setError("Por favor, seleccioná un archivo primero."); return; }

    setUploading(true);
    setError(null);
    try {
      const result = await uploadDocument(file, currentStep.value);
      onDocUploaded(result);
      setUploadedCount(c => c + 1);

      if (isLastStep) {
        await Swal.fire({
          icon: "success",
          title: "¡Verificación completada!",
          text: `Subiste ${uploadedCount + 1} documento${uploadedCount + 1 > 1 ? "s" : ""}. Los revisaremos en 24–48 hs.`,
          timer: 3000,
          showConfirmButton: false,
        });
        onClose();
      } else {
        setFile(null);
        setStepIndex(i => i + 1);
      }
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Error al subir el archivo. Intentá de nuevo.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  function handleSkip() {
    if (isLastStep) { onClose(); return; }
    setFile(null);
    setError(null);
    setStepIndex(i => i + 1);
  }

  return (
    <div className="doc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <div className="doc-modal" style={{ maxWidth: 560 }}>

        {/* Header */}
        <div className="doc-modal__header">
          <div>
            <h5 className="doc-modal__title" style={{ marginBottom: 2 }}>
              <IoShieldCheckmarkOutline style={{ marginRight: 8 }} />
              Verificación de Identidad
            </h5>
            <span className="text-muted" style={{ fontSize: 13 }}>
              Paso {stepIndex + 1} de {totalSteps} — {currentStep.label}
            </span>
          </div>
          <button className="doc-modal__close" onClick={onClose}><IoCloseOutline size={24} /></button>
        </div>

        {/* Barra de progreso */}
        <div style={{ height: 4, background: "#f0f0f0", borderRadius: 0 }}>
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, #6c63ff, #8b5cf6)",
              transition: "width 0.4s ease",
              borderRadius: 0,
            }}
          />
        </div>

        {/* Indicadores de paso */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "16px 24px 0" }}>
          {pendingSteps.map((step, i) => (
            <div key={step.value} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
                background: i < stepIndex ? "#198754" : i === stepIndex ? "#6c63ff" : "#e9ecef",
                color: i <= stepIndex ? "#fff" : "#adb5bd",
                transition: "all 0.3s",
              }}>
                {i < stepIndex ? <IoCheckmarkCircleOutline size={14} /> : i + 1}
              </div>
              {i < pendingSteps.length - 1 && (
                <div style={{ width: 24, height: 2, background: i < stepIndex ? "#198754" : "#e9ecef", transition: "background 0.3s" }} />
              )}
            </div>
          ))}
        </div>

        {/* Cuerpo */}
        <form onSubmit={handleNext} className="doc-modal__body" style={{ paddingTop: 16 }}>
          {/* Instrucción del paso */}
          <div style={{
            background: "#f8f9ff", border: "1px solid #e8e6ff",
            borderRadius: 10, padding: "14px 16px", marginBottom: 16,
          }}>
            <p style={{ margin: 0, fontSize: 14, color: "#444", lineHeight: 1.5 }}>
              {currentStep.description}
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#6c63ff" }}>
              💡 {currentStep.tip}
            </p>
          </div>

          <DropZone file={file} onFile={handleFileSelected} onClear={() => setFile(null)} />

          {error && (
            <div className="doc-error mt-3">
              <IoWarningOutline size={18} /> {error}
            </div>
          )}

          <div className="doc-modal__footer mt-4">
            <button
              type="button"
              className="doc-btn doc-btn--ghost-sm"
              onClick={handleSkip}
              disabled={uploading}
              style={{ fontSize: 13, color: "#888" }}
            >
              Saltar este paso
            </button>

            <div style={{ display: "flex", gap: 8 }}>
              {stepIndex > 0 && (
                <button
                  type="button"
                  className="doc-btn doc-btn--cancel"
                  onClick={() => { setFile(null); setError(null); setStepIndex(i => i - 1); }}
                  disabled={uploading}
                >
                  Anterior
                </button>
              )}
              <button
                type="submit"
                className="doc-btn doc-btn--primary"
                disabled={uploading || !file}
                style={{ minWidth: 140 }}
              >
                {uploading
                  ? <><span className="doc-spinner me-2" />Subiendo...</>
                  : isLastStep
                    ? <><IoCheckmarkCircleOutline className="me-2" />Finalizar</>
                    : <><IoArrowForwardOutline className="me-2" />Siguiente</>
                }
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── UploadModal (reemplazo individual) ──────────────────────────────────────

function UploadModal({ onClose, onUploaded, replaceId }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) { setError("Por favor, seleccioná un archivo primero."); return; }
    setUploading(true);
    setError(null);
    try {
      const result = await replaceDocument(replaceId, file);
      await Swal.fire({ icon: "success", title: "¡Éxito!", text: "Documento actualizado correctamente.", timer: 2000, showConfirmButton: false });
      onUploaded(result);
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Error al subir el archivo. Intentá de nuevo.";
      Swal.fire({ icon: "error", title: "Error", text: msg });
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="doc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <div className="doc-modal" style={{ maxWidth: 480 }}>
        <div className="doc-modal__header">
          <h5 className="doc-modal__title"><IoCloudUploadOutline /> Reemplazar documento</h5>
          <button className="doc-modal__close" onClick={onClose}><IoCloseOutline size={24} /></button>
        </div>
        <form className="doc-modal__body" onSubmit={handleSubmit}>
          <DropZone file={file} onFile={(f) => { const err = validateFile(f); if (err) { setError(err); } else { setError(null); setFile(f); } }} onClear={() => setFile(null)} />
          {error && <div className="doc-error mt-3"><IoWarningOutline size={18} /> {error}</div>}
          <div className="doc-modal__footer mt-4">
            <button type="button" className="doc-btn doc-btn--cancel" onClick={onClose} disabled={uploading}>Cancelar</button>
            <button type="submit" className="doc-btn doc-btn--primary" disabled={uploading || !file}>
              {uploading ? <><span className="doc-spinner me-2" />Subiendo...</> : <><IoCheckmarkCircleOutline className="me-2" />Confirmar Reemplazo</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Tarjeta de documento ─────────────────────────────────────────────────────

function DocumentCard({ doc, onReplace, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try { await onDelete(doc.id); }
    finally { setDeleting(false); setConfirmDelete(false); }
  }

  const renderTooltip = (props, text) => <Tooltip id="button-tooltip" {...props}>{text}</Tooltip>;

  return (
    <div className={`doc-card doc-card--${doc.documentStatus.toLowerCase()}`}>
      <div className="doc-card__main">
        <div className="doc-card__icon"><IoDocumentTextOutline size={24} /></div>
        <div className="doc-card__content">
          <div className="doc-card__type">{getDocTypeLabel(doc.documentType)}</div>
          <div className="doc-card__name">{doc.filename?.split("/").pop()}</div>
          <div className="doc-card__stats">
            {formatSize(doc.size)} • {new Date(doc.createdAt).toLocaleDateString()}
          </div>
          {doc.notes && doc.documentStatus === "REJECTED" && (
            <div className="doc-card__reason">
              <IoWarningOutline size={14} /> <strong>Motivo:</strong> {doc.notes}
            </div>
          )}
        </div>
      </div>

      <div className="doc-card__side">
        <StatusBadge status={doc.documentStatus} />

        {!confirmDelete ? (
          <div className="doc-card__actions">
            <OverlayTrigger placement="top" overlay={(p) => renderTooltip(p, "Ver documento")}>
              <a href={doc.url} target="_blank" rel="noreferrer" className="doc-action-btn doc-action-btn--view">
                <IoEyeOutline size={18} />
              </a>
            </OverlayTrigger>

            <OverlayTrigger placement="top" overlay={(p) => renderTooltip(p, "Actualizar archivo")}>
              <button
                onClick={async () => {
                  if (doc.documentStatus === "APPROVED" && KYC_TYPE_VALUES.has(doc.documentType)) {
                    const res = await Swal.fire({
                      title: "¿Actualizar documento verificado?",
                      text: "Al subir una nueva versión, tu perfil dejará de estar verificado hasta que revisemos el nuevo archivo.",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonText: "Sí, actualizar",
                      cancelButtonText: "Cancelar",
                    });
                    if (!res.isConfirmed) return;
                  }
                  onReplace(doc.id);
                }}
                className="doc-action-btn doc-action-btn--replace"
              >
                <IoRefreshOutline size={18} />
              </button>
            </OverlayTrigger>

            {doc.documentStatus !== "APPROVED" && (
              <OverlayTrigger placement="top" overlay={(p) => renderTooltip(p, "Eliminar")}>
                <button onClick={() => setConfirmDelete(true)} className="doc-action-btn doc-action-btn--delete">
                  <IoTrashOutline size={18} />
                </button>
              </OverlayTrigger>
            )}
          </div>
        ) : (
          <div className="doc-card__confirm">
            <span className="small text-muted me-2">¿Seguro?</span>
            <button onClick={handleDelete} className="doc-btn doc-btn--danger-sm me-1" disabled={deleting}>
              {deleting ? <span className="doc-spinner" /> : "Sí"}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="doc-btn doc-btn--ghost-sm">No</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function DocumentsSection({ onVerificationStatusChange }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wizardOpen, setWizardOpen]   = useState(false); // wizard KYC
  const [replaceId, setReplaceId]     = useState(null);  // reemplazo individual

  // Verificación KYC Paraguay: requiere los 4 documentos obligatorios aprobados
  const checkVerification = useCallback((documentList) => {
    const isVerif = KYC_REQUIRED_TYPES.every(req =>
      documentList.some(d => d.documentType === req.value && d.documentStatus === "APPROVED")
    );
    if (onVerificationStatusChange) onVerificationStatusChange(isVerif);
  }, [onVerificationStatusChange]);

  const fetchDocs = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getMyDocuments();
      setDocs(data);
      checkVerification(data);
    } catch {
      setError("No pudimos cargar tus documentos.");
    } finally {
      setLoading(false);
    }
  }, [checkVerification]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  // Llamado por el wizard cuando sube cada paso
  function handleDocUploaded(newDoc) {
    setDocs(prev => {
      const exists = prev.find(d => d.id === newDoc.id);
      const updated = exists ? prev.map(d => d.id === newDoc.id ? newDoc : d) : [newDoc, ...prev];
      checkVerification(updated);
      return updated;
    });
  }

  // Llamado por el UploadModal de reemplazo
  function handleReplaced(updatedDoc) {
    setReplaceId(null);
    setDocs(prev => {
      const updated = prev.map(d => d.id === updatedDoc.id ? updatedDoc : d);
      checkVerification(updated);
      return updated;
    });
  }

  // Cuántos KYC docs pendientes quedan
  const kycPending = KYC_REQUIRED_TYPES.filter(req =>
    !docs.some(d => d.documentType === req.value && d.documentStatus !== "REJECTED")
  ).length;

  // Todos los 4 docs KYC fueron al menos subidos (PENDING o APPROVED)
  const allKycUploaded = KYC_REQUIRED_TYPES.every(req =>
    docs.some(d => d.documentType === req.value && d.documentStatus !== "REJECTED")
  );

  // Alguno está en revisión por el admin
  const anyKycPending = KYC_REQUIRED_TYPES.some(req =>
    docs.some(d => d.documentType === req.value && d.documentStatus === "PENDING")
  );

  return (
    <div className="doc-section">
      <div className="doc-section__header">
        <div className="doc-section__intro">
          <h5 className="doc-section__title">Verificación de Perfil</h5>
          <p className="doc-section__text">
            Completá los 4 pasos de identidad para verificar tu cuenta y acceder a todas las funcionalidades.
          </p>

          {/* Checklist KYC */}
          <div className="doc-requirements-box mt-3 p-3 bg-white border rounded">
            <h6 className="small fw-bold text-uppercase text-muted mb-2" style={{ letterSpacing: "0.5px", fontSize: "11px" }}>
              Progreso de verificación:
            </h6>
            <div className="d-flex flex-wrap gap-3">
              {KYC_REQUIRED_TYPES.map(req => {
                const approved = docs.some(d => d.documentType === req.value && d.documentStatus === "APPROVED");
                const pending  = docs.some(d => d.documentType === req.value && d.documentStatus === "PENDING");
                return (
                  <div
                    key={req.value}
                    className={`d-flex align-items-center gap-2 small ${approved ? "text-success" : pending ? "text-warning" : "text-muted"}`}
                  >
                    {approved ? <IoCheckmarkCircleOutline /> : pending ? <IoTimeOutline /> : <IoCloseCircleOutline />}
                    {req.label}
                    {pending && <span style={{ fontSize: "10px" }}>(en revisión)</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="d-flex flex-column gap-2 align-items-end">
          {/* Botón principal: wizard KYC */}
          <button
            className="doc-section__add-btn"
            onClick={() => setWizardOpen(true)}
            disabled={kycPending === 0 || anyKycPending}
            title={
              anyKycPending
                ? "Tus documentos están en revisión — en breve recibirás una respuesta"
                : kycPending === 0
                  ? "Ya subiste todos los documentos requeridos"
                  : undefined
            }
          >
            <IoShieldCheckmarkOutline size={18} />
            {kycPending === 0 && !anyKycPending
              ? "Documentos completados"
              : anyKycPending
                ? `En revisión (${KYC_REQUIRED_TYPES.filter(r => docs.some(d => d.documentType === r.value && d.documentStatus === "PENDING")).length} pendiente${KYC_REQUIRED_TYPES.filter(r => docs.some(d => d.documentType === r.value && d.documentStatus === "PENDING")).length > 1 ? "s" : ""})`
                : `Completar verificación (${kycPending} faltante${kycPending > 1 ? "s" : ""})`
            }
          </button>
          {!allKycUploaded && kycPending > 0 && (
            <span style={{ fontSize: 11, color: "#9ca3af", textAlign: "right" }}>
              Debés subir los {kycPending} documento{kycPending > 1 ? "s" : ""} restante{kycPending > 1 ? "s" : ""} para enviar la solicitud
            </span>
          )}
          {anyKycPending && (
            <span style={{ fontSize: 11, color: "#d97706", textAlign: "right", display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              <IoTimeOutline size={14} /> Documentos en revisión por el equipo de OpenRoof
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <span className="doc-spinner doc-spinner--large" />
          <p className="text-muted mt-2">Cargando tus archivos...</p>
        </div>
      ) : error ? (
        <div className="doc-error-state p-4 text-center">
          <IoWarningOutline size={40} className="mb-2 text-danger opacity-50" />
          <p>{error}</p>
          <button className="btn btn-sm btn-outline-danger" onClick={fetchDocs}>Intentar de nuevo</button>
        </div>
      ) : docs.length === 0 ? (
        <div className="doc-empty-state">
          <div className="doc-empty-state__icon"><IoFileTrayFullOutline size={48} /></div>
          <h6>No hay documentos cargados</h6>
          <p>Completá los 4 pasos de verificación para validar tu identidad.</p>
          <button className="doc-btn doc-btn--primary" onClick={() => setWizardOpen(true)}>
            <IoShieldCheckmarkOutline className="me-2" />
            Iniciar verificación
          </button>
        </div>
      ) : (
        <div className="doc-list mt-2">
          {docs.map(doc => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onReplace={(id) => setReplaceId(id)}
              onDelete={async (id) => {
                await deleteDocument(id);
                const updated = docs.filter(d => d.id !== id);
                setDocs(updated);
                checkVerification(updated);
                Swal.fire({ icon: "success", title: "Eliminado", text: "El archivo fue removido.", timer: 1500, showConfirmButton: false });
              }}
            />
          ))}
        </div>
      )}

      {/* Wizard KYC */}
      {wizardOpen && (
        <KYCWizardModal
          onClose={() => setWizardOpen(false)}
          onDocUploaded={handleDocUploaded}
          existingDocs={docs}
        />
      )}

      {/* Modal de reemplazo individual */}
      {replaceId && (
        <UploadModal
          onClose={() => setReplaceId(null)}
          onUploaded={handleReplaced}
          replaceId={replaceId}
        />
      )}
    </div>
  );
}
