import { useState, useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Container, Spinner, Alert } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import CustomNavbar from "../components/Landing/Navbar";
import Footer from "../components/Landing/Footer";
import { CiUser, CiMail, CiPhone } from "react-icons/ci";
import { IoPencilOutline, IoCloseOutline, IoCheckmarkOutline } from "react-icons/io5";
import { LuTag } from "react-icons/lu";
import DocumentsSection from "../components/profile/DocumentsSection";

function EditProfileModal({ profile, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(profile?.avatarUrl || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Solo se permiten imágenes (JPEG, PNG, WebP, GIF).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar 5 MB.");
      return;
    }
    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let avatarData = null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const { data: avatarRes } = await api.post("/users/me/avatar", formData);
        avatarData = avatarRes.data;
      }

      const { data: profileRes } = await api.put("/users/me", {
        name: form.name,
        phone: form.phone,
      });
      const updatedProfile = avatarData
        ? { ...profileRes.data, avatarUrl: profileRes.data.avatarUrl ?? avatarData.avatarUrl }
        : profileRes.data;

      onSaved(updatedProfile);
    } catch {
      setError("No se pudo guardar los cambios. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="uedit-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="uedit-modal" role="dialog" aria-modal="true" aria-labelledby="uedit-title">
        <div className="uedit-header">
          <h5 className="uedit-title" id="uedit-title">
            <IoPencilOutline size={18} />
            Editar Perfil
          </h5>
          <button className="uedit-close-btn" onClick={onClose} aria-label="Cerrar">
            <IoCloseOutline size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="uedit-form">
          {error && <div className="uedit-error">{error}</div>}

          {/* ─── Avatar upload ─────────────────────────────────────── */}
          <div className="uedit-field">
            <label className="uedit-label">
              <CiUser size={15} /> Foto de perfil
            </label>
            <div className="uedit-avatar-upload">
              <div
                className="uedit-avatar-upload__circle"
                onClick={() => fileInputRef.current?.click()}
                title="Haz clic para cambiar tu foto"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" onError={(e) => { e.target.style.display = "none"; }} />
                ) : (
                  <CiUser size={36} />
                )}
                <div className="uedit-avatar-upload__overlay">
                  <IoPencilOutline size={16} />
                </div>
              </div>
              <div className="uedit-avatar-upload__info">
                <button
                  type="button"
                  className="uedit-avatar-upload__btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFile ? "Cambiar imagen" : "Subir foto"}
                </button>
                <span className="uedit-avatar-upload__hint">
                  {selectedFile ? selectedFile.name : "JPEG, PNG, WebP, GIF — máx. 5 MB"}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* ─── Name ──────────────────────────────────────────────── */}
          <div className="uedit-field">
            <label className="uedit-label" htmlFor="uedit-name">
              <CiUser size={15} /> Nombre completo
            </label>
            <input
              id="uedit-name"
              name="name"
              type="text"
              className="uedit-input"
              value={form.name}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              maxLength={100}
            />
          </div>

          {/* ─── Phone ─────────────────────────────────────────────── */}
          <div className="uedit-field">
            <label className="uedit-label" htmlFor="uedit-phone">
              <CiPhone size={15} /> Teléfono
            </label>
            <input
              id="uedit-phone"
              name="phone"
              type="tel"
              className="uedit-input"
              value={form.phone}
              onChange={handleChange}
              placeholder="+595 991 000 000"
              maxLength={30}
            />
          </div>

          <div className="uedit-footer">
            <button type="button" className="uedit-btn-cancel" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="uedit-btn-save" disabled={saving}>
              {saving ? <span className="uedit-spinner" /> : <IoCheckmarkOutline size={16} />}
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const UserProfilePage = () => {
  const location = useLocation();
  const { isAuthenticated, token } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const fetchProfile = async () => {
      try {
        setError(null);
        setLoading(true);
        const { data: res } = await api.get("/users/me");
        if (!isCancelled) setProfile(res.data);
      } catch {
        if (!isCancelled) setError("No se pudo cargar el perfil. Intenta de nuevo.");
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    if (isAuthenticated) fetchProfile();
    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, token]);

  function handleSaved(updatedProfile) {
    setProfile(updatedProfile);
    setEditOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <>
        <CustomNavbar />
        <Container className="py-5">
          <Alert variant="danger">{error}</Alert>
        </Container>
        <Footer />
      </>
    );
  }

  const fields = [
    { label: "Full Name", value: profile?.name, icon: <CiUser size={16} /> },
    { label: "Email", value: profile?.email, icon: <CiMail size={16} /> },
    { label: "Phone", value: profile?.phone, icon: <CiPhone size={16} /> },
    { label: "Role", value: profile?.role, icon: <LuTag size={14} />, isRole: true },
  ];

  return (
    <div className="uprofile-page bg-light min-vh-100">
      <CustomNavbar />

      <Container className="py-5">
        <div className="uprofile-card">
          <div className="uprofile-banner" />

          {saveSuccess && (
            <div className="uprofile-toast">
              <IoCheckmarkOutline size={16} />
              Perfil actualizado correctamente
            </div>
          )}

          <div className="uprofile-header">
            <div className="uprofile-avatar-group">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name || "Avatar"} className="uprofile-avatar" />
              ) : (
                <div className="uprofile-avatar uprofile-avatar--placeholder">
                  <CiUser size={54} />
                </div>
              )}
              <div className="uprofile-identity">
                <h2 className="uprofile-name" style={{ display: 'flex', alignItems: 'center' }}>
                  {profile?.name || "Sin nombre"}
                  {isVerified ? (
                    <span className="uprofile-badge uprofile-badge--verified ms-3">
                      <IoCheckmarkOutline size={14} className="me-1"/> Perfil Verificado
                    </span>
                  ) : (
                    <span className="uprofile-badge uprofile-badge--pending ms-3">
                      Pendiente de verificación
                    </span>
                  )}
                </h2>
                <p className="uprofile-email">
                  <CiMail size={15} className="uprofile-email-icon" />
                  {profile?.email || ""}
                </p>
              </div>
            </div>

            <button className="uprofile-edit-btn" onClick={() => setEditOpen(true)}>
              <IoPencilOutline size={15} />
              Editar Perfil
            </button>
          </div>

          <div className="uprofile-section">
            <h5 className="uprofile-section-title">Información Personal</h5>
            <div className="uprofile-fields">
              {fields.map(({ label, value, icon, isRole }) => (
                <div className="uprofile-field" key={label}>
                  <label className="uprofile-label">
                    {icon}
                    {label}
                  </label>
                  {isRole ? (
                    <div>
                      <span className="uprofile-role-badge">{value || "—"}</span>
                    </div>
                  ) : (
                    <input type="text" className="uprofile-input" value={value || "—"} disabled />
                  )}
                </div>
              ))}
            </div>
          </div>

          <DocumentsSection onVerificationStatusChange={setIsVerified} />
        </div>
      </Container>

      <Footer />

      {editOpen && (
        <EditProfileModal profile={profile} onClose={() => setEditOpen(false)} onSaved={handleSaved} />
      )}
    </div>
  );
};

export default UserProfilePage;
