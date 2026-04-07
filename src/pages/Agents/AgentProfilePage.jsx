import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Container, Spinner, Alert, Button } from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth";
import agentApi from "../../services/agents/agentApi";
import { getWhatsAppLink } from "../../utils/whatsapp";
import { IoPaperPlaneOutline, IoCallOutline, IoLogoInstagram, IoLogoFacebook, IoGlobeOutline, IoLinkOutline, IoPencilOutline, IoCheckmarkOutline, IoCloseOutline } from "react-icons/io5";
import "./AgentProfilePage.scss";

const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/women/68.jpg";

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
  const whatsappUrl = getWhatsAppLink(phone);
  const experienceYears = agent.experienceYears;
  
  // As recommended in plan, defaults/mocks if the backend doesn't provide them yet
  const descriptionFallback = agent.aboutMe || `${name} ha sido un profesional destacado y líder innovador en el sector inmobiliario. Como líder dedicado con amplios conocimientos y la convicción compartida de que los bienes raíces son un trabajo de servicio al cliente, siempre prioriza los intereses de quienes confían en él.\n\n${name} se apasiona por ayudar a las personas a cumplir sus sueños inmobiliarios, ya sea que compren su primera vivienda, reduzcan su tamaño, inviertan o realicen cualquier transacción. Su amplio conocimiento de las condiciones del mercado y tendencias lo convierten en la persona ideal a su lado.`;
  const specialties = agent.specialties && agent.specialties.length > 0 ? agent.specialties : ["Agente de comprador", "Propiedades de inversión", "Reubicación"];

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
                  Agente Inmobiliario {experienceYears && experienceYears > 5 ? 'Senior' : ''} • Valorant Real Estate PY
                </p>
              </div>
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={() => alert("Compañero: Aquí va la funcionalidad del modal para editar todo el perfil (Ticket pendiente)")}>
                <IoPencilOutline className="me-1" /> Editar Perfil
              </Button>
            </div>

            <div className="action-buttons mt-2">
              <a 
                href={whatsappUrl || "#"} 
                target={whatsappUrl ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="btn-message text-decoration-none"
              >
                <IoPaperPlaneOutline size={18} /> Message
              </a>
              {phone && (
                <a href={`tel:${phone}`} className="btn-call text-decoration-none">
                  <IoCallOutline size={18} /> {phone}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="details-card">
          <div className="about-section">
            <h3 className="section-title mb-3">Sobre mí</h3>
            {descriptionFallback.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <div className="specialties-section">
            <h3 className="section-title">Especialidades</h3>
            <div className="tags-container">
              {specialties.map((spec, index) => (
                <span key={index} className="specialty-tag">{spec}</span>
              ))}
            </div>
          </div>

          {experienceYears != null && (
            <div className="experience-section">
              {experienceYears} años de experiencia
            </div>
          )}

          <div className="links-section">
            <a href="#">
              <IoLinkOutline size={18} /> Visita la página del equipo
            </a>
            <div className="social-icons">
              <a href="#" aria-label="Instagram"><IoLogoInstagram /></a>
              <a href="#" aria-label="Facebook"><IoLogoFacebook /></a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
