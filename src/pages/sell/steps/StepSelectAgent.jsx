import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  StarFill,
  HouseDoor,
  ArrowLeft,
  CheckLg,
  ArrowRepeat,
  Search,
} from "react-bootstrap-icons";
import { getSuggestedAgents } from "../../../services/agents/agentApi";
import { createLeadFromWizard } from "../../../services/leads/leadApi";

export default function StepSelectAgent({ form, set, prevStep, onFinish }) {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await getSuggestedAgents({
          propertyType: form.propertyType,
          category: form.category,
          limit: 6,
        });
        setAgents(data);
      } catch (err) {
        console.error("Error fetching agents:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, [form.propertyType, form.category]);

  const handleSelect = (agentId) => {
    set("selectedAgentId", agentId);
  };

  const handleSellAlone = () => {
    set("selectedAgentId", null);
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      // Crear siempre el Lead en la BD con los datos del wizard
      await createLeadFromWizard(form);

      const selectedAgent = agents.find((a) => a.id === form.selectedAgentId);
      await Swal.fire({
        icon: "success",
        title: "¡Solicitud enviada!",
        text: form.selectedAgentId
          ? `Tu solicitud de contacto ha sido enviada a ${selectedAgent?.userName || "el agente"}. Se comunicará contigo pronto.`
          : "Gracias, hemos registrado tu solicitud. Un agente se pondrá en contacto si corresponde.",
        confirmButtonColor: "#2563eb",
      });

      if (onFinish) {
        onFinish(form);
      } else {
        // Redirigir al inicio tras crear el lead
        window.scrollTo(0, 0);
        navigate("/");
      }
    } catch (error) {
      console.error("Error creating lead:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al enviar tu solicitud. Por favor intenta de nuevo.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRefreshSuggestions = async () => {
    setLoading(true);
    try {
      const data = await getSuggestedAgents({
        propertyType: form.propertyType,
        category: form.category,
        limit: 6,
      });
      setAgents(data);
    } catch (err) {
      console.error("Error fetching agents:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sell-wizard__step sell-wizard__step--agents">
      <h2 className="sell-wizard__title">Agentes sugeridos para tu propiedad</h2>
      <p className="sell-wizard__subtitle">
        Basándonos en tu propiedad, encontramos estos agentes especializados para vos.
      </p>

      {loading ? (
        <div className="sell-wizard__loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p>Buscando los mejores agentes para tu propiedad...</p>
        </div>
      ) : (
        <>
          {agents.length > 0 && (
            <div className="suggested-agents">
              <div className="suggested-agents__grid">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className={`agent-card ${form.selectedAgentId === agent.id ? "agent-card--selected" : ""}`}
                    onClick={() => handleSelect(agent.id)}
                  >
                    <div className="agent-card__avatar">
                      {agent.userAvatarUrl ? (
                        <img src={agent.userAvatarUrl} alt={agent.userName} />
                      ) : (
                        <span>{getInitials(agent.userName)}</span>
                      )}
                    </div>

                    <div className="agent-card__rating">
                      <span className="agent-card__rating-score">
                        {agent.avgRating?.toFixed(1) || "5.0"}
                      </span>
                      <StarFill className="agent-card__rating-star" />
                      <span className="agent-card__rating-reviews">
                        ({agent.totalReviews || 0})
                      </span>
                    </div>

                    <h3 className="agent-card__name">{agent.userName}</h3>
                    <p className="agent-card__company">
                      {agent.companyName || "Agente independiente"}
                    </p>

                    <div className="agent-card__stats">
                      <p>
                        <strong>{agent.totalReviews || 0}</strong> ventas últimos 12 meses
                      </p>
                      <p>
                        <strong>{agent.experienceYears || 1}+</strong> años de experiencia
                      </p>
                    </div>

                    {agent.specialties?.length > 0 && (
                      <div className="agent-card__specialties">
                        <span className="agent-card__specialties-label">Especialidades:</span>
                        <div className="agent-card__specialties-tags">
                          {agent.specialties.slice(0, 3).map((spec, i) => (
                            <span key={i} className="agent-card__specialty-tag">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      className={`agent-card__contact-btn ${form.selectedAgentId === agent.id ? "agent-card__contact-btn--selected" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(agent.id);
                      }}
                    >
                      {form.selectedAgentId === agent.id ? (
                        <>
                          <CheckLg /> Seleccionado
                        </>
                      ) : (
                        "Contactar"
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="suggested-agents__fallback">
                <p className="suggested-agents__fallback-title">
                  ¿Ninguno de los agentes sugeridos es lo que buscas?
                </p>
                <p className="suggested-agents__fallback-text">
                  Prueba con otras sugerencias o explora el directorio completo. También puedes continuar sin agente.
                </p>
                <div className="suggested-agents__fallback-actions">
                  <button
                    type="button"
                    className="suggested-agents__action-btn suggested-agents__action-btn--outline"
                    onClick={handleRefreshSuggestions}
                  >
                    <ArrowRepeat /> Sugerir otros
                  </button>
                  <button
                    type="button"
                    className="suggested-agents__action-btn suggested-agents__action-btn--outline"
                    onClick={() => navigate("/agents")}
                  >
                    <Search /> Buscar agentes
                  </button>
                  <button
                    type="button"
                    className={`suggested-agents__action-btn ${form.selectedAgentId === null ? "suggested-agents__action-btn--active" : "suggested-agents__action-btn--outline"}`}
                    onClick={handleSellAlone}
                  >
                    <HouseDoor /> Publicar sin agente
                  </button>
                </div>
              </div>
            </div>
          )}

          {agents.length === 0 && (
            <div className="suggested-agents__empty">
              <HouseDoor size={48} />
              <h3>No encontramos agentes especializados</h3>
              <p>Puedes buscar en el directorio o publicar sin agente.</p>
              <div className="suggested-agents__fallback-actions">
                <button
                  type="button"
                  className="suggested-agents__action-btn suggested-agents__action-btn--primary"
                  onClick={() => navigate("/agents")}
                >
                  <Search /> Buscar agentes
                </button>
                <button
                  type="button"
                  className="suggested-agents__action-btn suggested-agents__action-btn--outline"
                  onClick={handleSellAlone}
                >
                  <HouseDoor /> Publicar sin agente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="sell-wizard__actions">
        <button
          type="button"
          className="sell-wizard__btn sell-wizard__btn--back"
          onClick={prevStep}
        >
          <ArrowLeft /> Atrás
        </button>
        <button
          type="button"
          className="sell-wizard__btn sell-wizard__btn--next"
          onClick={handleFinish}
          disabled={loading || submitting}
        >
          {submitting ? "Procesando..." : <>Finalizar <CheckLg /></>}
        </button>
      </div>
    </div>
  );
}
