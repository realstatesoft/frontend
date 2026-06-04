import { useState, useEffect, useMemo, useCallback } from "react";
import { Container, Button, Spinner, Form, Modal } from "react-bootstrap";
import {
  IoCheckmarkOutline, IoCloseOutline, IoEyeOutline,
  IoDocumentTextOutline, IoPersonOutline, IoMailOutline,
  IoCallOutline, IoShieldCheckmarkOutline, IoCalendarOutline,
  IoAlertCircleOutline, IoTimeOutline, IoCheckmarkCircleOutline,
  IoCloseCircleOutline, IoWarningOutline
} from "react-icons/io5";
import Swal from "sweetalert2";
import api from "../../services/api";
import { KYC_REQUIRED, DOC_LABELS } from "../../constants/documents";

// ─── Constantes ───────────────────────────────────────────────────────────────

const formatSize = (bytes) => {
  if (!bytes) return "—";
  const k = 1024, sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDate = (dt) =>
  dt ? new Date(dt).toLocaleDateString("es-PY", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function kycStatus(userDocs) {
  const approved = KYC_REQUIRED.filter(t => userDocs.some(d => d.documentType === t && d.documentStatus === "APPROVED")).length;
  const pending  = KYC_REQUIRED.filter(t => userDocs.some(d => d.documentType === t && d.documentStatus === "PENDING")).length;
  const total    = KYC_REQUIRED.length;
  return { approved, pending, total, complete: approved === total };
}

// ─── StatusPill ───────────────────────────────────────────────────────────────

function StatusPill({ status }) {
  const map = {
    PENDING:  { cls: "kyc-pill--pending",  icon: <IoTimeOutline size={14} />, label: "Pendiente" },
    APPROVED: { cls: "kyc-pill--approved", icon: <IoCheckmarkOutline size={14} />, label: "Aprobado"  },
    REJECTED: { cls: "kyc-pill--rejected", icon: <IoCloseOutline size={14} />, label: "Rechazado" },
  };
  const { cls, icon, label } = map[status] ?? map.PENDING;
  return <span className={`kyc-pill ${cls}`}>{icon} {label}</span>;
}

// ─── Modal de Perfil KYC ──────────────────────────────────────────────────────

function UserProfileModal({ user, docs, onClose, onUpdateDoc, processingId }) {
  const kyc       = kycStatus(docs);
  const kycDocs   = docs.filter(d => KYC_REQUIRED.includes(d.documentType));
  const extraDocs = docs.filter(d => !KYC_REQUIRED.includes(d.documentType));

  // Rechazar: usa SweetAlert con textarea para evitar conflictos de foco/z-index con Bootstrap Modal
  async function handleReject(doc) {
    const label = DOC_LABELS[doc.documentType] ?? doc.documentType;
    const { value: reason, isConfirmed } = await Swal.fire({
      title: 'Rechazar Documento',
      html: `Documento: <strong>${label}</strong><br><span style="font-size:13px;color:#6b7280">El usuario recibirá un email con el motivo.</span>`,
      input: 'textarea',
      inputPlaceholder: 'Ej: La imagen está borrosa o los bordes están cortados...',
      inputAttributes: { 'aria-label': 'Motivo del rechazo', rows: 3 },
      showCancelButton: true,
      confirmButtonText: 'Confirmar Rechazo',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      reverseButtons: true,
      inputValidator: (value) => {
        if (!value || !value.trim()) return 'Debés escribir el motivo del rechazo.';
      },
    });
    if (isConfirmed && reason?.trim()) {
      await onUpdateDoc(doc.id, 'REJECTED', reason.trim());
    }
 }

  const memberSince = user.userCreatedAt
    ? new Date(user.userCreatedAt).toLocaleDateString("es-PY", { month: "long", year: "numeric" })
    : "—";

  const progressPct = (kyc.approved / kyc.total) * 100;
  const progressCls = kyc.complete ? "--complete" : "--partial";

  return (
    <>
      <Modal show onHide={onClose} size="xl" centered scrollable enforceFocus={false}>
        <Modal.Header closeButton style={{ padding: "1.25rem 1.75rem", borderBottom: "1px solid var(--color-border)" }}>
          <Modal.Title style={{ fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <IoShieldCheckmarkOutline style={{ color: "var(--color-accent, #2563eb)" }} />
            Revisión de Solicitud 
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: 0 }}>
          <div className="kyc-modal-grid">

            {/* ── Sidebar ── */}
            <div className="kyc-sidebar">
              {/* Avatar */}
              {user.userAvatarUrl
                ? <img src={user.userAvatarUrl} alt={user.userName} className="kyc-sidebar__avatar" />
                : (
                  <div className="kyc-sidebar__avatar-placeholder">
                    <IoPersonOutline size={32} color="rgba(255,255,255,0.6)" />
                  </div>
                )
              }
              <p className="kyc-sidebar__name">{user.userName || "Sin nombre"}</p>
              <p className="kyc-sidebar__role">{user.userRole}</p>

              {/* Progreso KYC */}
              <div className="kyc-sidebar__progress">
                <div className="kyc-sidebar__progress-title">Estado KYC</div>
                <div className={`kyc-sidebar__progress-count kyc-sidebar__progress-count${progressCls}`}>
                  {kyc.approved}/{kyc.total}
                </div>
                <div className="kyc-sidebar__progress-sub">documentos aprobados</div>
                <div className="kyc-sidebar__progress-bar">
                  <div
                    className={`kyc-sidebar__progress-bar-fill kyc-sidebar__progress-bar-fill${progressCls}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Contacto */}
              <div className="kyc-sidebar__contacts">
                {[
                  { icon: <IoMailOutline size={14} />, label: user.userEmail || "—" },
                  { icon: <IoCallOutline size={14} />, label: user.userPhone || "Sin teléfono" },
                  { icon: <IoCalendarOutline size={14} />, label: `Miembro desde ${memberSince}` },
                ].map(({ icon, label }, i) => (
                  <div key={i} className="kyc-contact-row">
                    <span className="kyc-contact-row__icon">{icon}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Contenido principal ── */}
            <div className="kyc-content">

              {/* Docs KYC obligatorios */}
              <p className="kyc-section-title">Documentos requeridos para verificación</p>
              {KYC_REQUIRED.map(type => {
                const doc = kycDocs.find(d => d.documentType === type);
                const rowCls = !doc ? "kyc-doc-row--missing"
                  : doc.documentStatus === "APPROVED" ? "kyc-doc-row--approved"
                  : doc.documentStatus === "REJECTED"  ? "kyc-doc-row--rejected"
                  : "kyc-doc-row--pending";

                return (
                  <div key={type} className={`kyc-doc-row ${rowCls}`}>
                    <div className="kyc-doc-row__left">
                      <div className="kyc-doc-row__icon">
                        <IoDocumentTextOutline size={18} />
                      </div>
                      <div>
                        <div className="kyc-doc-row__label">{DOC_LABELS[type]}</div>
                        {doc ? (
                          <div className="kyc-doc-row__meta">
                            {doc.filename?.split("/").pop()} • {formatSize(doc.size)} • {formatDate(doc.createdAt)}
                          </div>
                        ) : (
                          <div className="kyc-doc-row__meta">No subido aún</div>
                        )}
                        {doc?.notes && doc.documentStatus === "REJECTED" && (
                          <div className="kyc-doc-row__rejection">
                            <IoAlertCircleOutline size={13} /> {doc.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="kyc-doc-row__right">
                      {doc
                        ? <StatusPill status={doc.documentStatus} />
                        : <span className="kyc-pill kyc-pill--missing">No subido</span>
                      }

                      {doc && (
                        <button
                          className="kyc-doc-row__btn-view"
                          onClick={() => window.open(doc.url, "_blank", "noopener,noreferrer")}
                        >
                          <IoEyeOutline size={14} /> Ver
                        </button>
                      )}

                      {doc?.documentStatus === "PENDING" && (
                        <>
                          <Button
                            size="sm" variant="success"
                            className="d-flex align-items-center gap-1"
                            onClick={() => onUpdateDoc(doc.id, "APPROVED", null)}
                            disabled={processingId === doc.id}
                          >
                            {processingId === doc.id
                              ? <Spinner size="sm" />
                              : <><IoCheckmarkOutline /> Aprobar</>
                            }
                          </Button>
                          <Button
                            size="sm" variant="outline-danger"
                            className="d-flex align-items-center gap-1"
                            onClick={() => handleReject(doc)}
                            disabled={processingId === doc.id}
                          >
                            <IoCloseOutline /> Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Docs adicionales */}
              {extraDocs.length > 0 && (
                <>
                  <p className="kyc-section-title mt-4">Documentos adicionales</p>
                  {extraDocs.map(doc => (
                    <div key={doc.id} className="kyc-doc-row">
                      <div className="kyc-doc-row__left">
                        <div className="kyc-doc-row__icon">
                          <IoDocumentTextOutline size={16} />
                        </div>
                        <div>
                          <div className="kyc-doc-row__label">
                            {DOC_LABELS[doc.documentType] ?? doc.documentType}
                          </div>
                          <div className="kyc-doc-row__meta">
                            {formatSize(doc.size)} • {formatDate(doc.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="kyc-doc-row__right">
                        <StatusPill status={doc.documentStatus} />
                        <button className="kyc-doc-row__btn-view" onClick={() => window.open(doc.url, "_blank", "noopener,noreferrer")}>
                          <IoEyeOutline size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

// ─── Tarjeta de solicitud por usuario ────────────────────────────────────────

function UserRequestCard({ userId, userName, userEmail, userAvatarUrl, docs, onReview }) {
  const kyc        = kycStatus(docs);
  const hasPending = docs.some(d => d.documentStatus === "PENDING");

  const cardMod = kyc.complete ? "kyc-card--complete" : hasPending ? "kyc-card--has-pending" : "";

  const statusLabel = kyc.complete ? <><IoCheckmarkCircleOutline size={16} style={{ color: "var(--color-success)" }} /> Verificado</>
    : hasPending ? <><IoTimeOutline size={16} style={{ color: "var(--color-warning)" }} /> En revisión</>
    : <><IoWarningOutline size={16} style={{ color: "var(--color-text-muted)" }} /> Incompleto</>;

  return (
    <div className={`kyc-card ${cardMod}`} onClick={onReview}>
      {/* Avatar */}
      {userAvatarUrl
        ? <img src={userAvatarUrl} alt={userName} className="kyc-card__avatar" />
        : (
          <div className="kyc-card__avatar-placeholder">
            <IoPersonOutline size={22} />
          </div>
        )
      }

      {/* Info */}
      <div className="kyc-card__info">
        <div className="kyc-card__name">{userName || "Usuario #" + userId}</div>
        <div className="kyc-card__email">{userEmail}</div>
      </div>

      {/* Dots KYC */}
      <div className="kyc-card__dots">
        {KYC_REQUIRED.map(type => {
          const doc = docs.find(d => d.documentType === type);
          const dotCls = !doc ? "kyc-card__dot--missing"
            : doc.documentStatus === "APPROVED" ? "kyc-card__dot--approved"
            : doc.documentStatus === "REJECTED"  ? "kyc-card__dot--rejected"
            : "kyc-card__dot--pending";
          return (
            <div
              key={type}
              className={`kyc-card__dot ${dotCls}`}
              title={`${DOC_LABELS[type]} — ${doc?.documentStatus ?? "No subido"}`}
            />
          );
        })}
      </div>

      {/* Estado + botón */}
      <div className="kyc-card__status">
        <div className="kyc-card__status-label d-flex align-items-center gap-1 justify-content-end">{statusLabel}</div>
        <div className="kyc-card__status-sub">
          {kyc.approved}/{kyc.total} aprobados • {docs.length} total
        </div>
      </div>

      <button
        className="kyc-card__action-btn"
        onClick={e => { e.stopPropagation(); onReview(); }}
      >
        Revisar perfil
      </button>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminDocumentsPage() {
  const [documents, setDocuments]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("ALL");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      let allDocs = [];
      let page = 0;
      let last = false;
      const MAX_PAGES = 50; 

      while (!last && page < MAX_PAGES) {
        const response = await api.get(`/users/documents?page=${page}&size=100`);
        const data = response.data;

        if (data?.success && data?.data) {
          const content = data.data.content || [];
          allDocs = [...allDocs, ...content];
          
          last = data.data.last === true;
          if (last || content.length === 0) {
            last = true;
          } else {
            page++;
          }
        } else {
          last = true;
        }
      }

      if (page >= MAX_PAGES) {
        throw new Error("Se alcanzó el límite máximo de páginas. Hay demasiados documentos para mostrar en una sola carga.");
      }
      
      setDocuments(allDocs);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Error desconocido";
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los documentos: " + errorMsg,
        icon: "error"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  // Agrupar por userId
  const userGroups = useMemo(() => {
    const map = new Map();
    documents.forEach(doc => {
      if (!map.has(doc.userId)) {
        map.set(doc.userId, {
          userId:       doc.userId,
          userName:     doc.userName,
          userEmail:    doc.userEmail,
          userPhone:    doc.userPhone,
          userRole:     doc.userRole,
          userAvatarUrl:doc.userAvatarUrl,
          userCreatedAt:doc.userCreatedAt,
          docs: [],
        });
      }
      map.get(doc.userId).docs.push(doc);
    });
    return Array.from(map.values());
  }, [documents]);

  const filteredGroups = useMemo(() => {
    if (filter === "ALL")      return userGroups;
    if (filter === "PENDING")  return userGroups.filter(g => g.docs.some(d => d.documentStatus === "PENDING"));
    if (filter === "APPROVED") return userGroups.filter(g => kycStatus(g.docs).complete);
    if (filter === "REJECTED") return userGroups.filter(g => g.docs.some(d => d.documentStatus === "REJECTED"));
    return userGroups;
  }, [userGroups, filter]);

  const selectedUser = selectedUserId ? userGroups.find(g => g.userId === selectedUserId) : null;

  async function handleUpdateDoc(docId, newStatus, notes) {
    try {
      setProcessingId(docId);
      const body = { documentStatus: newStatus };
      if (notes) body.notes = notes;
      await api.patch(`/users/documents/${docId}/status`, body);
      Swal.fire(
        newStatus === "APPROVED" ? "Aprobado" : "Rechazado",
        newStatus === "APPROVED" ? "El documento fue verificado correctamente." : "El documento fue rechazado.",
        "success"
      );
      await fetchDocuments();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || err.message,
        icon: "error"
      });
    } finally {
      setProcessingId(null);
    }
  }

  const stats = useMemo(() => ({
    total:   userGroups.length,
    pending: userGroups.filter(g => g.docs.some(d => d.documentStatus === "PENDING")).length,
    done:    userGroups.filter(g => kycStatus(g.docs).complete).length,
  }), [userGroups]);

  return (
    <Container fluid className="kyc-page">

      {/* Header */}
      <div className="kyc-page__header">
        <div>
          <h2>Verificación de Identidad</h2>
          <p>Revisión de solicitudes de usuarios</p>
        </div>
        <Form.Select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ width: 200 }}
        >
          <option value="ALL">Todos los usuarios</option>
          <option value="PENDING">Con docs pendientes</option>
          <option value="APPROVED">Verificados</option>
          <option value="REJECTED">Con rechazos</option>
        </Form.Select>
      </div>

      {/* Métricas */}
      <div className="kyc-stats">
        <div className="kyc-stat-card kyc-stat-card--total">
          <div className="kyc-stat-card__value">{stats.total}</div>
          <div className="kyc-stat-card__label">Solicitudes totales</div>
        </div>
        <div className="kyc-stat-card kyc-stat-card--pending">
          <div className="kyc-stat-card__value">{stats.pending}</div>
          <div className="kyc-stat-card__label">En revisión</div>
        </div>
        <div className="kyc-stat-card kyc-stat-card--done">
          <div className="kyc-stat-card__value">{stats.done}</div>
          <div className="kyc-stat-card__label">Verificados</div>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="kyc-empty">
          <IoDocumentTextOutline size={56} />
          <p>No hay solicitudes que coincidan.</p>
        </div>
      ) : (
        <div className="kyc-list">
          {filteredGroups.map(group => (
            <UserRequestCard
              key={group.userId}
              {...group}
              onReview={() => setSelectedUserId(group.userId)}
            />
          ))}
        </div>
      )}

      {/* Modal de perfil */}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          docs={selectedUser.docs}
          onClose={() => setSelectedUserId(null)}
          onUpdateDoc={handleUpdateDoc}
          processingId={processingId}
        />
      )}
    </Container>
  );
}
