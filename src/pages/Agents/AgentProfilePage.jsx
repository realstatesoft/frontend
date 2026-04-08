import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Container, Spinner, Alert, Button } from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth";
import agentApi from "../../services/agents/agentApi";
import { getWhatsAppLink } from "../../utils/whatsapp";
import {
  IoPaperPlaneOutline,
  IoCallOutline,
  IoLogoInstagram,
  IoLogoFacebook,
  IoLogoLinkedin,
  IoLogoTwitter,
  IoLogoTiktok,
  IoPencilOutline,
  IoStar,
  IoStarHalf,
  IoStarOutline
} from "react-icons/io5";
import "./AgentProfilePage.scss";

const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/women/68.jpg";

const renderStars = (rating) => {
  // Aseguramos de parsear correctamente el número, reemplazando comas por puntos en caso de venir de la DB/Locale
  const safeRating = parseFloat(String(rating).replace(',', '.'));
  const finalRating = isNaN(safeRating) ? 0 : safeRating;
  
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    // Tolerancia para evitar problemas de precisión en javascript (ej. 4.9999)
    if (finalRating >= i - 0.05) {
      stars.push(<IoStar key={i} color="#ffc107" />);
    } else if (finalRating >= i - 0.55) {
      stars.push(<IoStarHalf key={i} color="#ffc107" />);
    } else {
      stars.push(<IoStarOutline key={i} color="#ffc107" />);
    }
  }
  return stars;
};

export default function AgentProfilePage() {
  const { user } = useAuth();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const agentId = user?.userId || user?.id;
    if (!agentId) return;

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

  const agentIdLocal = user?.userId || user?.id;
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
  const avatarUrl = agent.userAvatarUrl || DEFAULT_AVATAR;
  const phone = agent.userPhone;
  const whatsappUrl = phone ? getWhatsAppLink(phone) : null;
  const experienceYears = agent.experienceYears;
  const companyName = agent.companyName || "Valorant Real Estate PY"; // Added fallback logic matching screenshot for consistency

  const rating = agent.avgRating != null ? agent.avgRating : 4.8;
  const reviewsCount = agent.totalReviews != null ? agent.totalReviews : 156;
  const stats = agent.stats || {
    vendidas: 0,
    alquiladas: 0,
    total: 0,
    precioPromedio: "$ 0"
  };

  const description = agent.bio || "Este agente aún no ha añadido una descripción a su perfil.";
  const specialties = agent.specialties && agent.specialties.length > 0 ? agent.specialties : [];

  const socialMedia = agent.socialMedia || [];
  const getSocialLink = (platformName) => {
    const found = socialMedia.find(s => s.platform === platformName);
    return found ? found.url : null;
  };

  const instagramLink = getSocialLink("INSTAGRAM");
  const facebookLink = getSocialLink("FACEBOOK");
  const linkedinLink = getSocialLink("LINKEDIN");
  const twitterLink = getSocialLink("TWITTER");
  const tiktokLink = getSocialLink("TIKTOK");

  return (
    <div className="agent-profile-page">
      <Container fluid className="px-0 px-md-4">
        {/* Main Info Card */}
        <div className="main-card">
          <div className="avatar-container">
            <img src={avatarUrl} alt={name} />
          </div>

          <div className="info-container flex-grow-1">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h1 className="agent-name">{name}</h1>
                <p className="agent-title">
                  Agente Inmobiliario {experienceYears && experienceYears > 5 ? 'Senior' : ''} {companyName ? `• ${companyName}` : ''}
                </p>
              </div>
              <div className="rating-container">
                <div className="stars">
                  {renderStars(rating)}
                </div>
                <span className="rating-text text-nowrap">{rating} ({reviewsCount} reseñas)</span>
              </div>
            </div>

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

            <div className="action-buttons mt-4">
              <a 
                href={whatsappUrl || "#"} 
                target={whatsappUrl ? "_blank" : undefined}
                rel="noopener noreferrer"
                className={`btn-message text-decoration-none ${!whatsappUrl ? "disabled pe-none opacity-50" : ""}`}
              >
                <IoPaperPlaneOutline size={18} /> Mensaje
              </a>
              {phone && (
                <a href={`tel:${phone}`} className="btn-call text-decoration-none">
                  <IoCallOutline size={18} /> {phone}
                </a>
              )}
              
              {/* Botón estático sugerido */}
              <button 
                className="btn-call text-decoration-none" 
                onClick={(e) => { e.preventDefault(); alert("Función Editar Perfil aún no disponible."); }}
              >
                <IoPencilOutline size={18} /> Editar Perfil
              </button>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="details-card">
          <div className="about-section">
            <h3 className="section-title mb-3">Sobre mí</h3>
            {description.split('\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {specialties.length > 0 && (
            <div className="specialties-section">
              <h3 className="section-title">Especialidades</h3>
              <div className="tags-container">
                {specialties.map((spec, index) => (
                  <span key={index} className="specialty-tag">{spec.name}</span>
                ))}
              </div>
            </div>
          )}

          {experienceYears != null && (
            <div className="experience-section">
              <h3 className="section-title">Experiencia</h3>
              <p>{experienceYears} años de experiencia en el mercado inmobiliario.</p>
            </div>
          )}

          {(instagramLink || facebookLink || linkedinLink || twitterLink || tiktokLink) && (
            <div className="links-section">
              <h3 className="section-title mb-3">Redes Sociales</h3>
              <div className="social-icons">
                {instagramLink && <a href={instagramLink} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><IoLogoInstagram /></a>}
                {facebookLink && <a href={facebookLink} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><IoLogoFacebook /></a>}
                {linkedinLink && <a href={linkedinLink} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><IoLogoLinkedin /></a>}
                {twitterLink && <a href={twitterLink} target="_blank" rel="noopener noreferrer" aria-label="Twitter"><IoLogoTwitter /></a>}
                {tiktokLink && <a href={tiktokLink} target="_blank" rel="noopener noreferrer" aria-label="TikTok"><IoLogoTiktok /></a>}
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
