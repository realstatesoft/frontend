/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Spinner, Alert } from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth";
import agentApi from "../../services/agents/agentApi";
import { IoMail } from "react-icons/io5";
import "./AgentProfilePage.scss";

const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/women/68.jpg";

export default function AgentProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const agentId = user?.agentProfileId || user?.userId || user?.id;
    if (!agentId) {
       setLoading(false);
       return;
    }

    agentApi
      .getAgentById(agentId)
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
  }, [user]);

  const agentIdLocal = user?.agentProfileId || user?.userId || user?.id;
  if (!agentIdLocal) {
    return (
      <Container className="py-5 bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <Alert variant="danger" className="text-center w-100 shadow-sm" style={{ maxWidth: '500px' }}>
          <h4>Acceso denegado</h4>
          <p className="mb-0">No se pudo resolver tu identificador personal. Por favor, intenta cerrar sesión e ingresar nuevamente.</p>
        </Alert>
      </Container>
    );
  }

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
        <Alert variant="warning">{error || "Agente no encontrado."}</Alert>
      </Container>
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
  const specialties = agent.specialties && agent.specialties.length > 0 ? agent.specialties : [];
  const stats = agent.stats;
  
  const rating = agent.avgRating;
  const reviewsCount = agent.totalReviews;
  const hasRating = rating != null;

  return (
    <div className="agent-profile-page-new">
      <div className="profile-header-banner"></div>
      
      <Container className="profile-main-container">
        
        {/* Top Header Card */}
        <div className="profile-top-section d-flex justify-content-between align-items-end flex-wrap gap-3">
          <div className="d-flex align-items-center gap-4">
            <div className="avatar-wrapper">
              <img src={avatarUrl} alt={name} className="profile-avatar" />
            </div>
            <div className="profile-names-wrapper pb-2">
              <h2 className="mb-1 profile-name">{name}</h2>
              <div className="d-flex flex-wrap gap-3 mt-1">
                <span className="text-muted profile-email">
                   {email}
                </span>
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
              className="btn btn-primary px-4 py-2 custom-edit-btn" 
              onClick={() => navigate(`/agent/editar-perfil/${agent.id || agentIdLocal}`)}
            >
              Editar Perfil
            </button>
          </div>
        </div>

        <div className="profile-content mt-4">
          {/* Información General y Detalles DB */}
          <div className="profile-section">
            <h4 className="section-title">Información General</h4>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="agent-name" className="form-label">Nombre Completo</label>
                <input id="agent-name" type="text" className="form-control profile-input" value={name} readOnly />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="agent-phone" className="form-label">Teléfono</label>
                <input id="agent-phone" type="text" className="form-control profile-input" value={phone} readOnly />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="agent-company" className="form-label">Compañía / Agencia</label>
                <input id="agent-company" type="text" className="form-control profile-input" value={companyName} readOnly />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="agent-experience" className="form-label">Años de Experiencia</label>
                <input id="agent-experience" type="text" className="form-control profile-input" value={experienceYears + (experienceYears == 1 ? " año" : " años")} readOnly />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="agent-license" className="form-label">Número de Licencia</label>
                <input id="agent-license" type="text" className="form-control profile-input" value={licenseNumber} readOnly />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="agent-email" className="form-label">Correo Electrónico</label>
                <input id="agent-email" type="text" className="form-control profile-input" value={email} readOnly />
              </div>
            </div>
          </div>

          {/* Información Profesional */}
          <div className="profile-section">
            <h4 className="section-title">Información Profesional</h4>
            
            <div className="mb-4">
              <label htmlFor="agent-bio" className="form-label">Biografía</label>
              <textarea 
                id="agent-bio"
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
                  specialties.map(s => {
                    const displayName = s.name 
                      ? s.name.charAt(0).toUpperCase() + s.name.slice(1).toLowerCase()
                      : "";
                    return (
                      <span key={s.id} className="custom-badge badge-blue">
                        {displayName}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-muted fst-italic">No hay especialidades registradas.</span>
                )}
              </div>
            </div>
          </div>

          {/* Estadísticas de Base de Datos */}
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
  );
}
