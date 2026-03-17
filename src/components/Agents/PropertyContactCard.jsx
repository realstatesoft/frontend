import { useState, useEffect } from "react";
import { Button, Image, Spinner } from "react-bootstrap";
import { StarFill } from "react-bootstrap-icons";
import agentApi from "../../services/agents/agentApi";
import { getWhatsAppLink } from "../../utils/whatsapp";

const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/women/68.jpg";

/**
 * PropertyContactCard
 * Muestra el card de contacto del propietario o agente asignado a una propiedad.
 * Si la propiedad tiene agentId, obtiene los datos del agente. Si no, muestra el owner.
 */
export default function PropertyContactCard({ property }) {
  const [agent, setAgent] = useState(null);
  const [loadingAgent, setLoadingAgent] = useState(false);

  const hasAgent = Boolean(property?.agentId);

  useEffect(() => {
    if (!hasAgent || !property.agentId) return;

    let cancelled = false;
    const id = setTimeout(() => {
      if (!cancelled) setLoadingAgent(true);
    }, 0);

    agentApi
      .getAgentById(property.agentId)
      .then((res) => {
        if (cancelled) return;
        const payload = res?.data ?? res;
        const agentData = payload?.data ?? payload;
        setAgent(agentData);
      })
      .catch(() => {
        if (!cancelled) setAgent(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingAgent(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(id);
      setAgent(null);
      setLoadingAgent(false);
    };
  }, [hasAgent, property?.agentId]);

  const name = agent?.userName ?? property?.ownerName ?? "Propietario";
  const avatarUrl = agent?.userAvatarUrl ?? DEFAULT_AVATAR;
  const phone = agent?.userPhone ?? property?.ownerPhone ?? null;
  const experienceYears = agent?.experienceYears ?? null;
  const rating = agent?.avgRating != null ? Number(agent.avgRating).toFixed(1) : null;
  const totalReviews = agent?.totalReviews ?? 0;

  const whatsappUrl = getWhatsAppLink(phone);

  if (loadingAgent) {
    return (
      <div
        className="property-contact-card"
        style={{
          border: "2px solid #111",
          borderRadius: "16px",
          padding: "1.5rem",
          backgroundColor: "#fff",
          textAlign: "center",
          minHeight: 280,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  return (
    <div
      className="property-contact-card"
      style={{
        border: "2px solid #111",
        borderRadius: "16px",
        padding: "1.5rem",
        backgroundColor: "#fff",
        textAlign: "center",
        position: "sticky",
        top: 20,
      }}
    >
      <div className="d-flex justify-content-center mb-2">
        <Image
          src={avatarUrl}
          alt={name}
          roundedCircle
          style={{
            width: 80,
            height: 80,
            objectFit: "cover",
            border: "3px solid #111",
          }}
        />
      </div>

      <h6
        className="fw-bold mb-1"
        style={{ fontSize: "1.1rem", color: "#111" }}
      >
        {name}
      </h6>

      <p
        className="mb-2"
        style={{ fontSize: "0.85rem", color: "#666" }}
      >
        {experienceYears != null
          ? `${experienceYears} años de experiencia`
          : hasAgent
          ? "Agente inmobiliario"
          : "Propietario"}
      </p>

      {(rating != null || totalReviews > 0) && (
        <div className="mb-3 d-flex align-items-center justify-content-center gap-1">
          <span style={{ color: "#f0ad4e", fontSize: "0.95rem" }}>
            {"★".repeat(5)}
          </span>
          <span style={{ fontSize: "0.85rem", color: "#111" }}>
            {rating ?? "—"} ({totalReviews} reseñas)
          </span>
        </div>
      )}

      {!(rating != null || totalReviews > 0) && (
        <div className="mb-3 d-flex align-items-center justify-content-center gap-1">
          <StarFill size={14} style={{ color: "#f0ad4e" }} />
          <span style={{ fontSize: "0.85rem", color: "#666" }}>
            Sin valoraciones aún
          </span>
        </div>
      )}

      <Button
        variant="outline-dark"
        className="w-100 mb-2"
        style={{ borderRadius: "8px", borderWidth: 2 }}
        as={whatsappUrl ? "a" : "button"}
        href={whatsappUrl || undefined}
        target={whatsappUrl ? "_blank" : undefined}
        rel={whatsappUrl ? "noopener noreferrer" : undefined}
        disabled={!whatsappUrl}
      >
        Contactar {hasAgent ? "Agente" : "Propietario"}
      </Button>

      <Button
        variant="dark"
        className="w-100"
        style={{ borderRadius: "8px" }}
      >
        Agendar Visita
      </Button>
    </div>
  );
}
