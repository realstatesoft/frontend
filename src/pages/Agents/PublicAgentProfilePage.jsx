/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Spinner, Alert } from "react-bootstrap";
import { ArrowLeft, CheckLg } from "react-bootstrap-icons";
import CustomNavbar from "../../components/Landing/Navbar";
import Footer from "../../components/Landing/Footer";
import agentApi from "../../services/agents/agentApi";
import "./AgentProfilePage.scss";

const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/men/32.jpg";

export default function PublicAgentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    agentApi
      .getAgentById(id)
      .then((res) => {
        if (!cancelled) {
          const payload = res?.data ?? res;
          const agentData = payload?.data ?? payload;
          setAgent(agentData);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);
          setError("No se pudo cargar el perfil del agente.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <>
        <CustomNavbar />
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
          <Spinner animation="border" variant="primary" />
        </div>
      </>
    );
  }

  if (error || !agent) {
    return (
      <>
        <CustomNavbar />
        <Container className="py-5 bg-light min-vh-100">
          <Alert variant="warning">{error || "Agente no encontrado."}</Alert>
        </Container>
      </>
    );
  }

  const name = agent.userName || "Agente Inmobiliario";
  const email = agent.userEmail || "Sin registro";
  const phone = agent.userPhone || "No especificado";
  const avatarUrl = agent.userAvatarUrl || DEFAULT_AVATAR;
  const companyName = agent.companyName || "No especificado";
  const licenseNumber = agent.licenseNumber || "No especificado";
  const experienceYears = agent.experienceYears || 0;
  const bio = agent.bio || "El agente no cuenta con una biografía registrada.";
  const specialties =
    agent.specialties && agent.specialties.length > 0 ? agent.specialties : [];
  const stats = agent.stats;

  const rating = agent.avgRating;
  const reviewsCount = agent.totalReviews;
  const hasRating = rating != null;

  return (
    <>
      <CustomNavbar />
      <div className="agent-profile-page-new">
        <div className="profile-header-banner" style={{ position: "relative" }}>
          <button
            className="btn d-flex align-items-center gap-1"
            onClick={() => navigate(-1)}
            style={{
              position: "absolute",
              top: "1rem",
              left: "1.5rem",
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(4px)",
              border: "none",
              borderRadius: "20px",
              padding: "0.4rem 1rem",
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "#333",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <ArrowLeft size={15} /> Volver
          </button>
        </div>

        <Container className="profile-main-container">
          {/* Top Header */}
          <div className="profile-top-section d-flex justify-content-between align-items-end flex-wrap gap-3">
            <div className="d-flex align-items-center gap-4">
              <div className="avatar-wrapper">
                <img src={avatarUrl} alt={name} className="profile-avatar" />
              </div>
              <div className="profile-names-wrapper pb-2">
                <h2 className="mb-1 profile-name">{name}</h2>
                <div className="d-flex flex-wrap gap-3 mt-1">
                  <span className="text-muted profile-email">{email}</span>
                  {hasRating && (
                    <span className="text-muted text-warning fw-medium">
                      ★ {rating} ({reviewsCount} reseñas)
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="pb-2">
              <button
                className="btn btn-primary px-4 py-2"
                style={{ borderRadius: "8px", fontWeight: 600 }}
                onClick={() => {
                  const fromWizard = !!sessionStorage.getItem("wizardReturnStep");
                  if (fromWizard) {
                    sessionStorage.setItem(
                      "selectedAgentFromSearch",
                      JSON.stringify({
                        id: agent.id ?? parseInt(id),
                        name,
                        avatarUrl,
                      })
                    );
                    navigate("/sell");
                  } else {
                    alert(`Agente seleccionado: ${name}`);
                  }
                }}
              >
                <CheckLg className="me-1" /> Seleccionar
              </button>
            </div>
          </div>

          <div className="profile-content mt-4">
            {/* General Info */}
            <div className="profile-section">
              <h4 className="section-title">Información General</h4>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nombre Completo</label>
                  <input
                    type="text"
                    className="form-control profile-input"
                    value={name}
                    readOnly
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="text"
                    className="form-control profile-input"
                    value={phone}
                    readOnly
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Compañía / Agencia</label>
                  <input
                    type="text"
                    className="form-control profile-input"
                    value={companyName}
                    readOnly
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Años de Experiencia</label>
                  <input
                    type="text"
                    className="form-control profile-input"
                    value={
                      experienceYears +
                      (experienceYears === 1 ? " año" : " años")
                    }
                    readOnly
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Número de Licencia</label>
                  <input
                    type="text"
                    className="form-control profile-input"
                    value={licenseNumber}
                    readOnly
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Correo Electrónico</label>
                  <input
                    type="text"
                    className="form-control profile-input"
                    value={email}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div className="profile-section">
              <h4 className="section-title">Información Profesional</h4>

              <div className="mb-4">
                <label className="form-label">Biografía</label>
                <textarea
                  className="form-control profile-textarea"
                  rows="5"
                  value={bio}
                  readOnly
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Especialidades</label>
                <div className="d-flex flex-wrap gap-2">
                  {specialties.length > 0 ? (
                    specialties.map((s) => {
                      const displayName = s.name
                        ? s.name.charAt(0).toUpperCase() +
                          s.name.slice(1).toLowerCase()
                        : "";
                      return (
                        <span key={s.id} className="custom-badge badge-blue">
                          {displayName}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-muted fst-italic">
                      No hay especialidades registradas.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="profile-section pb-5">
                <h4 className="section-title">Estadísticas de Actividad</h4>
                <div className="agent-stats">
                  <div className="stat-card stat-blue">
                    <span className="stat-value">{stats.vendidas}</span>
                    <span className="stat-label">Vendidas</span>
                  </div>
                  <div className="stat-card stat-green">
                    <span className="stat-value">{stats.alquiladas}</span>
                    <span className="stat-label">Alquiladas</span>
                  </div>
                  <div className="stat-card stat-purple">
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Total</span>
                  </div>
                  <div className="stat-card stat-orange">
                    <span className="stat-value">{stats.precioPromedio}</span>
                    <span className="stat-label">Precio promedio</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Container>
      </div>
      <Footer />
    </>
  );
}
