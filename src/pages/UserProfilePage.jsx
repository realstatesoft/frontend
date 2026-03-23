import { useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Container, Spinner, Alert } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import CustomNavbar from "../components/Landing/Navbar";
import Footer from "../components/Landing/Footer";
import { CiUser, CiMail, CiPhone } from "react-icons/ci";
import { IoPencilOutline } from "react-icons/io5";
import { LuTag } from "react-icons/lu";

const UserProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, token } = useAuth();

  // Datos del usuario devueltos por GET /users/me
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Al montar el componente, obtiene los datos del usuario autenticado
   * desde el endpoint GET /users/me. Si el token no es valido,
   * el interceptor global redirige a /login automaticamente.
   */
  useEffect(() => {
    let isCancelled = false;

    const fetchProfile = async () => {
      try {
        setError(null);
        setLoading(true);
        const { data: res } = await api.get("/users/me");
        if (!isCancelled) {
          setProfile(res.data);
        }
      } catch (err) {
        if (!isCancelled) {
          if (err.response?.status === 401) {
            navigate("/login", { replace: true });
          } else {
            setError("No se pudo cargar el perfil. Intenta de nuevo.");
          }
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }

    return () => { isCancelled = true; };
  }, [isAuthenticated, token, navigate]);

  // Si no esta autenticado, redirigir a login preservando la ruta actual
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Loader centrado mientras se obtienen los datos
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Error generico
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

  // Campos de informacion personal con sus iconos
  const fields = [
    { label: "Full Name",  value: profile?.name,  icon: <CiUser size={16} /> },
    { label: "Email",      value: profile?.email, icon: <CiMail size={16} /> },
    { label: "Phone",      value: profile?.phone, icon: <CiPhone size={16} /> },
    { label: "Role",       value: profile?.role,  icon: <LuTag size={14} />, isRole: true },
  ];

  return (
    <div className="uprofile-page bg-light min-vh-100">
      <CustomNavbar />

      <Container className="py-5">
        <div className="uprofile-card">

          {/* ── Banner ────────────────────────────────────── */}
          <div className="uprofile-banner" />

          {/* ── Header: avatar + datos + boton ───────────── */}
          <div className="uprofile-header">
            <div className="uprofile-avatar-group">
              {/* Avatar: foto de perfil o placeholder */}
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

            {/* Boton Editar Perfil */}
            <button className="uprofile-edit-btn">
              <IoPencilOutline size={15} />
              Editar Perfil
            </button>
          </div>

          {/* ── Seccion: Informacion Personal ────────────── */}
          <div className="uprofile-section">
            <h5 className="uprofile-section-title">Información Personal</h5>

            <div className="uprofile-fields">
              {fields.map(({ label, value, icon, isRole }) => (
                <div className="uprofile-field" key={label}>
                  <label className="uprofile-label">
                    {icon}
                    {label}
                  </label>

                  {/* El campo Role se muestra como badge */}
                  {isRole ? (
                    <div>
                      <span className="uprofile-role-badge">{value || "—"}</span>
                    </div>
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
    </div>
  );
};

export default UserProfilePage;
