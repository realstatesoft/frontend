import { useState, useEffect, useCallback } from "react";
import { Card, Button, Spinner, Badge, Row, Col, Alert } from "react-bootstrap";
import { getSuggestedAgents } from "../../services/agents/agentApi";
import { PROPERTY_TYPE, CATEGORY } from "../../constants/propertyEnums";

/**
 * Componente para mostrar y seleccionar agentes sugeridos.
 * @param {Object} props
 * @param {string} [props.propertyType] - Tipo de propiedad (label en español)
 * @param {string} [props.category] - Categoría (label en español)
 * @param {string} [props.city] - Ciudad o zona
 * @param {number|null} props.selectedAgentId - ID del agente seleccionado
 * @param {function} props.onSelectAgent - Callback cuando se selecciona un agente
 * @param {number} [props.limit=5] - Cantidad máxima de agentes a mostrar
 */
export default function SuggestedAgents({
  propertyType,
  category,
  city,
  selectedAgentId,
  onSelectAgent,
  limit = 5,
}) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSelector, setShowSelector] = useState(false);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit };

      // Mapear valores del form (español) a enums del backend
      if (propertyType && PROPERTY_TYPE[propertyType]) {
        params.propertyType = PROPERTY_TYPE[propertyType];
      }
      if (category && CATEGORY[category]) {
        params.category = CATEGORY[category];
      }
      if (city) {
        params.city = city;
      }

      const response = await getSuggestedAgents(params);
      if (response?.success && Array.isArray(response.data)) {
        setAgents(response.data);
      } else {
        setAgents([]);
      }
    } catch (err) {
        console.log(err);
      setError("No se pudieron cargar los agentes sugeridos.");
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [propertyType, category, city, limit]);

  useEffect(() => {
    if (showSelector) {
      fetchAgents();
    }
  }, [showSelector, fetchAgents]);

  const handleToggleSelector = () => {
    setShowSelector((prev) => !prev);
    if (!showSelector) {
      onSelectAgent(null);
    }
  };

  const handleSelectAgent = (agent) => {
    onSelectAgent(agent.id === selectedAgentId ? null : agent.id);
  };

  const renderRating = (rating) => {
    const stars = Math.round(rating || 0);
    return (
      <span className="text-warning">
        {"★".repeat(stars)}
        {"☆".repeat(5 - stars)}
        <span className="text-muted ms-1">({rating?.toFixed(1) || "0.0"})</span>
      </span>
    );
  };

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  return (
    <div className="mb-4">
      <h5 className="mb-3">
        <i className="bi bi-person-badge me-2"></i>
        ¿Querés vender con un agente?
      </h5>

      <p className="text-muted mb-3">
        Un agente inmobiliario puede ayudarte a vender tu propiedad más rápido y al mejor precio.
      </p>

      <div className="d-flex gap-3 mb-3">
        <Button
          variant={!showSelector ? "primary" : "outline-secondary"}
          onClick={() => {
            setShowSelector(false);
            onSelectAgent(null);
          }}
        >
          <i className="bi bi-house-door me-2"></i>
          Vender solo
        </Button>
        <Button
          variant={showSelector ? "primary" : "outline-primary"}
          onClick={handleToggleSelector}
        >
          <i className="bi bi-person-check me-2"></i>
          Vender con agente
        </Button>
      </div>

      {showSelector && (
        <div className="border rounded p-3 bg-light">
          <h6 className="mb-3">Agentes recomendados para tu propiedad</h6>

          {loading && (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" size="sm" />
              <span className="ms-2">Buscando agentes...</span>
            </div>
          )}

          {error && (
            <Alert variant="warning" className="mb-3">
              {error}
              <Button
                variant="link"
                size="sm"
                className="p-0 ms-2"
                onClick={fetchAgents}
              >
                Reintentar
              </Button>
            </Alert>
          )}

          {!loading && !error && agents.length === 0 && (
            <Alert variant="info" className="mb-0">
              No se encontraron agentes disponibles para esta zona/tipo de propiedad.
            </Alert>
          )}

          {!loading && agents.length > 0 && (
            <Row xs={1} md={2} lg={3} className="g-3">
              {agents.map((agent) => (
                <Col key={agent.id}>
                  <Card
                    className={`h-100 cursor-pointer transition-all ${
                      selectedAgentId === agent.id
                        ? "border-primary shadow"
                        : "border-light"
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSelectAgent(agent)}
                  >
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex align-items-start mb-2">
                        <div
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                          style={{ width: 48, height: 48, minWidth: 48 }}
                        >
                          {agent.userAvatarUrl ? (
                            <img
                              src={agent.userAvatarUrl}
                              alt={agent.userName}
                              className="rounded-circle w-100 h-100 object-fit-cover"
                            />
                          ) : (
                            <span className="fs-5">
                              {agent.userName?.charAt(0)?.toUpperCase() || "A"}
                            </span>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-0">{agent.userName}</h6>
                          {agent.companyName && (
                            <small className="text-muted">{agent.companyName}</small>
                          )}
                        </div>
                        {selectedAgentId === agent.id && (
                          <Badge bg="primary" className="ms-2">
                            <i className="bi bi-check2"></i>
                          </Badge>
                        )}
                      </div>

                      <div className="mb-2">{renderRating(agent.avgRating)}</div>

                      <div className="small text-muted mt-auto">
                        {agent.experienceYears > 0 && (
                          <div>
                            <i className="bi bi-briefcase me-1"></i>
                            {agent.experienceYears} años de experiencia
                          </div>
                        )}
                        {agent.totalReviews > 0 && (
                          <div>
                            <i className="bi bi-chat-dots me-1"></i>
                            {agent.totalReviews} reseñas
                          </div>
                        )}
                        {agent.licenseNumber && (
                          <div>
                            <i className="bi bi-card-checklist me-1"></i>
                            Lic: {agent.licenseNumber}
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {selectedAgent && (
            <Alert variant="success" className="mt-3 mb-0">
              <i className="bi bi-check-circle me-2"></i>
              Has seleccionado a <strong>{selectedAgent.userName}</strong>
              {selectedAgent.companyName && ` de ${selectedAgent.companyName}`}.
              Te contactarán pronto.
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
