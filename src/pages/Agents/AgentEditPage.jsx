/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Spinner, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import agentApi from "../../services/agents/agentApi";
import {
  IoArrowBack,
  IoCheckmarkOutline,
  IoTrashOutline,
  IoAddOutline,
} from "react-icons/io5";
import "./AgentEditPage.scss";

const SOCIAL_PLATFORMS = [
  { value: "FACEBOOK", label: "Facebook" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "TWITTER", label: "Twitter / X" },
  { value: "TIKTOK", label: "TikTok" },
];

export default function AgentEditPage() {
  const { t } = useTranslation("agent");
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const redirectTimerRef = useRef(null);

  // ── Resolve authenticated user ID ────────────────────────────
  const authenticatedId = user?.userId || user?.id;

  // ── Early guard: route id must match the authenticated user ──
  useEffect(() => {
    if (authenticatedId && id && String(id) !== String(authenticatedId)) {
      navigate("/agent/perfil", { replace: true });
    }
  }, [id, authenticatedId, navigate]);

  // ── Cleanup redirect timer on unmount ─────────────────────────
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  // ── Data loading ──────────────────────────────────────────────
  const [agent, setAgent] = useState(null);
  const [specialtiesCatalog, setSpecialtiesCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Form state ────────────────────────────────────────────────
  const [form, setForm] = useState({
    companyName: "",
    bio: "",
    experienceYears: 0,
    licenseNumber: "",
    specialtyIds: [],
    socialMedia: [],
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Load agent + specialties catalog ──────────────────────────
  useEffect(() => {
    if (!authenticatedId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      agentApi.getAgentById(authenticatedId),
      agentApi.getAllSpecialties(),
    ])
      .then(([agentRes, specRes]) => {
        if (cancelled) return;

        const agentPayload = agentRes?.data ?? agentRes;
        const agentData = agentPayload?.data ?? agentPayload;
        setAgent(agentData);

        const specPayload = specRes?.data ?? specRes;
        const specList = specPayload?.data ?? specPayload;
        setSpecialtiesCatalog(Array.isArray(specList) ? specList : []);

        // Pre-fill form
        setForm({
          companyName: agentData.companyName || "",
          bio: agentData.bio || "",
          experienceYears: agentData.experienceYears ?? 0,
          licenseNumber: agentData.licenseNumber || "",
          specialtyIds: agentData.specialties
            ? agentData.specialties.map((s) => s.id)
            : [],
          socialMedia: agentData.socialMedia
            ? agentData.socialMedia.map((sm) => ({
                platform: sm.platform,
                url: sm.url,
              }))
            : [],
        });

        setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);
          setError(t("edit.loadError"));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authenticatedId]);

  // ── Handlers ──────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleExperienceChange(e) {
    const val = parseInt(e.target.value, 10);
    setForm((prev) => ({
      ...prev,
      experienceYears: isNaN(val) ? 0 : Math.max(0, val),
    }));
  }

  function handleSpecialtyToggle(specId) {
    setForm((prev) => {
      const ids = prev.specialtyIds.includes(specId)
        ? prev.specialtyIds.filter((sid) => sid !== specId)
        : [...prev.specialtyIds, specId];
      return { ...prev, specialtyIds: ids };
    });
  }

  // Social media handlers
  function handleAddSocialMedia() {
    setForm((prev) => ({
      ...prev,
      socialMedia: [...prev.socialMedia, { platform: "FACEBOOK", url: "" }],
    }));
  }

  function handleRemoveSocialMedia(index) {
    setForm((prev) => ({
      ...prev,
      socialMedia: prev.socialMedia.filter((_, i) => i !== index),
    }));
  }

  function handleSocialMediaChange(index, field, value) {
    setForm((prev) => {
      const updated = [...prev.socialMedia];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, socialMedia: updated };
    });
  }

  // ── Submit ────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const payload = {
        companyName: form.companyName || null,
        bio: form.bio || null,
        experienceYears: form.experienceYears,
        licenseNumber: form.licenseNumber || null,
        specialtyIds: form.specialtyIds,
        socialMedia: form.socialMedia.filter((sm) => sm.url.trim() !== ""),
      };

      await agentApi.updateAgent(authenticatedId, payload);
      setSaveSuccess(true);
      redirectTimerRef.current = setTimeout(() => {
        navigate("/agent/perfil");
      }, 1200);
    } catch (err) {
      console.error(err);
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        t("edit.saveError");
      setSaveError(serverMsg);
    } finally {
      setSaving(false);
    }
  }

  // ── Render: loading / error ───────────────────────────────────
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <Container className="py-5 bg-light min-vh-100">
        <Alert variant="warning">{error || t("edit.notFound")}</Alert>
        <button
          className="btn btn-outline-secondary mt-3"
          onClick={() => navigate(-1)}
        >
          <IoArrowBack size={16} className="me-1" />
          {t("back")}
        </button>
      </Container>
    );
  }

  const name = agent.userName || "Agente Inmobiliario";
  const email = agent.userEmail || "Sin registro";

  // ── Main render ───────────────────────────────────────────────
  return (
    <div className="agent-edit-page">
      {/* Banner */}
      <div className="edit-header-banner">
        <div className="banner-overlay">
          <Container className="d-flex align-items-center gap-3 h-100">
            <button
              className="btn-back-circle"
              onClick={() => navigate("/agent/perfil")}
              title={t("edit.backToProfile")}
              aria-label={t("edit.backToProfile")}
            >
              <IoArrowBack size={20} />
            </button>
            <div>
              <h2 className="banner-title mb-0">{t("edit.title")}</h2>
              <p className="banner-subtitle mb-0">
                {name} — {email}
              </p>
            </div>
          </Container>
        </div>
      </div>

      <Container className="edit-main-container">
        {/* Success Toast */}
        {saveSuccess && (
          <div className="edit-toast edit-toast--success">
            <IoCheckmarkOutline size={18} />
            {t("edit.success")}
          </div>
        )}

        {/* Error Alert */}
        {saveError && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => setSaveError(null)}
            className="mt-3"
          >
            {saveError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="edit-form">
          {/* ── Información Profesional ──────────────────── */}
          <div className="edit-section">
            <h4 className="section-title">Información Profesional</h4>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="edit-companyName" className="form-label">
                  Compañía / Agencia
                </label>
                <input
                  id="edit-companyName"
                  name="companyName"
                  type="text"
                  className="form-control edit-input"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="Nombre de la compañía"
                  maxLength={255}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="edit-licenseNumber" className="form-label">
                  Número de Licencia
                </label>
                <input
                  id="edit-licenseNumber"
                  name="licenseNumber"
                  type="text"
                  className="form-control edit-input"
                  value={form.licenseNumber}
                  onChange={handleChange}
                  placeholder="Ej. AGT-12345"
                  maxLength={100}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="edit-experienceYears" className="form-label">
                  Años de Experiencia
                </label>
                <input
                  id="edit-experienceYears"
                  name="experienceYears"
                  type="number"
                  className="form-control edit-input"
                  value={form.experienceYears}
                  onChange={handleExperienceChange}
                  min={0}
                  max={80}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="edit-bio" className="form-label">
                Biografía
              </label>
              <textarea
                id="edit-bio"
                name="bio"
                className="form-control edit-textarea"
                rows="5"
                value={form.bio}
                onChange={handleChange}
                placeholder="Cuéntanos sobre tu experiencia, logros y áreas de expertise…"
              />
            </div>
          </div>

          {/* ── Especialidades ───────────────────────────── */}
          <div className="edit-section">
            <h4 className="section-title">Especialidades</h4>
            <p className="section-hint">
              Selecciona las especialidades que mejor describan tu perfil
              profesional.
            </p>
            <div className="specialties-grid">
              {specialtiesCatalog.map((spec) => {
                const isActive = form.specialtyIds.includes(spec.id);
                const displayName = spec.name
                  ? spec.name.charAt(0).toUpperCase() +
                    spec.name.slice(1).toLowerCase()
                  : "";
                return (
                  <button
                    key={spec.id}
                    type="button"
                    className={`specialty-chip ${isActive ? "specialty-chip--active" : ""}`}
                    onClick={() => handleSpecialtyToggle(spec.id)}
                  >
                    {displayName}
                    {isActive && <IoCheckmarkOutline size={14} className="ms-1" />}
                  </button>
                );
              })}
              {specialtiesCatalog.length === 0 && (
                <span className="text-muted fst-italic">
                  No hay especialidades disponibles en el sistema.
                </span>
              )}
            </div>
          </div>

          {/* ── Redes Sociales ───────────────────────────── */}
          <div className="edit-section">
            <h4 className="section-title">Redes Sociales</h4>
            <p className="section-hint">
              Agrega tus perfiles de redes sociales profesionales.
            </p>

            {form.socialMedia.map((sm, index) => (
              <div className="social-media-row" key={index}>
                <select
                  className="form-select edit-select"
                  value={sm.platform}
                  onChange={(e) =>
                    handleSocialMediaChange(index, "platform", e.target.value)
                  }
                >
                  {SOCIAL_PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <input
                  type="url"
                  className="form-control edit-input"
                  value={sm.url}
                  onChange={(e) =>
                    handleSocialMediaChange(index, "url", e.target.value)
                  }
                  placeholder="https://..."
                />
                <button
                  type="button"
                  className="btn-remove-social"
                  onClick={() => handleRemoveSocialMedia(index)}
                  title="Eliminar"
                >
                  <IoTrashOutline size={18} />
                </button>
              </div>
            ))}

            <button
              type="button"
              className="btn-add-social"
              onClick={handleAddSocialMedia}
            >
              <IoAddOutline size={18} />
              Agregar red social
            </button>
          </div>

          {/* ── Footer de Acciones ───────────────────────── */}
          <div className="edit-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/agent/perfil")}
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Guardando…
                </>
              ) : (
                <>
                  <IoCheckmarkOutline size={18} className="me-1" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </Container>
    </div>
  );
}
