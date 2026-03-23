import { useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Container, Spinner, Alert } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import CustomNavbar from "../components/Landing/Navbar";
import Footer from "../components/Landing/Footer";
import { CiUser, CiMail, CiPhone } from "react-icons/ci";
import { IoPencilOutline, IoCloseOutline, IoCheckmarkOutline } from "react-icons/io5";
import { LuTag } from "react-icons/lu";

// ─── Modal de edición ─────────────────────────────────────────────────────────

function EditProfileModal({ profile, onClose, onSaved }) {
  const [form, setForm] = useState({
    name:      profile?.name      || "",
    phone:     profile?.phone     || "",
    avatarUrl: profile?.avatarUrl || "",
  });
  const [saving, setSaving]   = useState(false);
  const [error,  setError]    = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { data: res } = await api.put("/users/me", {
        name:      form.name,
        phone:     form.phone,
        avatarUrl: form.avatarUrl,
      });
      onSaved(res.data);
    } catch (err) {
      setError("No se pudo guardar los cambios. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="uedit-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="uedit-modal" role="dialog" aria-modal="true" aria-labelledby="uedit-title">

        {/* Header */}
        <div className="uedit-header">
          <h5 className="uedit-title" id="uedit-title">
            <IoPencilOutline size={18} />
            Editar Perfil
          </h5>
          <button className="uedit-close-btn" onClick={onClose} aria-label="Cerrar">
            <IoCloseOutline size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="uedit-form">
          {error && <div className="uedit-error">{error}</div>}

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

          <div className="uedit-field">
            <label className="uedit-label" htmlFor="uedit-avatar">
              <CiUser size={15} /> URL de foto de perfil
            </label>
            <input
              id="uedit-avatar"
              name="avatarUrl"
              type="url"
              className="uedit-input"
              value={form.avatarUrl}
              onChange={handleChange}
              placeholder="https://ejemplo.com/foto.jpg"
            />
            {/* Preview de la imagen si se ingresa URL */}
            {form.avatarUrl && (
              <div className="uedit-avatar-preview">
                <img
                  src={form.avatarUrl}
                  alt="Preview"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="uedit-footer">
            <button type="button" className="uedit-btn-cancel" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="uedit-btn-save" disabled={saving}>
              {saving ? (
                <span className="uedit-spinner" />
              ) : (
                <IoCheckmarkOutline size={16} />
              )}
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

const UserProfilePage = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { isAuthenticated, token } = useAuth();

  const [profile,     setProfile]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [editOpen,    setEditOpen]    = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const fetchProfile = async () => {
      try {
        setError(null);
        setLoading(true);
        const { data: res } = await api.get("/users/me");
        if (!isCancelled) setProfile(res.data);
      } catch (err) {
        if (!isCancelled) setError("No se pudo cargar el perfil. Intenta de nuevo.");
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    if (isAuthenticated) fetchProfile();
    return () => { isCancelled = true; };
  }, [isAuthenticated, token]);

  // Callback cuando el modal guarda exitosamente
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
    { label: "Full Name", value: profile?.name,  icon: <CiUser  size={16} /> },
    { label: "Email",     value: profile?.email, icon: <CiMail  size={16} /> },
    { label: "Phone",     value: profile?.phone, icon: <CiPhone size={16} /> },
    { label: "Role",      value: profile?.role,  icon: <LuTag   size={14} />, isRole: true },
  ];

  return (
    <div className="uprofile-page bg-light min-vh-100">
      <CustomNavbar />

      <Container className="py-5">
        <div className="uprofile-card">

          {/* Banner */}
          <div className="uprofile-banner" />

          {/* Toast de éxito */}
          {saveSuccess && (
            <div className="uprofile-toast">
              <IoCheckmarkOutline size={16} />
              Perfil actualizado correctamente
            </div>
          )}

          {/* Header */}
          <div className="uprofile-header">
            <div className="uprofile-avatar-group">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name || "Avatar"}
                  className="uprofile-avatar"
                />
              ) : (
                <div className="uprofile-avatar uprofile-avatar--placeholder">
                  <CiUser size={54} />
                </div>
              )}
              <div className="uprofile-identity">
                <h2 className="uprofile-name">{profile?.name || "Sin nombre"}</h2>
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

          {/* Información Personal */}
          <div className="uprofile-section">
            <h5 className="uprofile-section-title">Información Personal</h5>
            <div className="uprofile-fields">
              {fields.map(({ label, value, icon, isRole }) => (
                <div className="uprofile-field" key={label}>
                  <label className="uprofile-label">
                    {icon}{label}
                  </label>
                  {isRole ? (
                    <div><span className="uprofile-role-badge">{value || "—"}</span></div>
                  ) : (
                    <input
                      type="text"
                      className="uprofile-input"
                      value={value || "—"}
                      disabled
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </Container>

      <Footer />

      {/* Modal de edición */}
      {editOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default UserProfilePage;
