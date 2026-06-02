import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Spinner, Alert, Card, Row, Col, Button } from "react-bootstrap";
import { StarFill } from "react-bootstrap-icons";
import CustomNavbar from "../../components/Landing/Navbar";
import Footer from "../../components/Landing/Footer";
import ReviewForm from "../../components/Agents/ReviewForm";
import { useMyAgents } from "../../hooks/useMyAgents";

export default function MyAgentsPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useMyAgents();
  const [reviewModalAgent, setReviewModalAgent] = useState(null);

  const agents = data?.content ?? [];

  const getInitials = (name) => {
    if (!name) return "A";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <>
      <CustomNavbar />
      <Container className="py-5 min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
        <h2 className="fw-bold mb-4">Mis Agentes</h2>
        <p className="text-muted mb-4">
          Agentes con los que has interactuado. Puedes dejarles una reseña o ver su perfil completo.
        </p>

        {isLoading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Cargando tus agentes...</p>
          </div>
        )}

        {error && (
          <Alert variant="warning">
            No se pudieron cargar tus agentes. Por favor intenta de nuevo.
          </Alert>
        )}

        {!isLoading && !error && agents.length === 0 && (
          <Alert variant="info">
            Aún no tienes agentes asociados. Puedes buscar agentes en{" "}
            <Link to="/AgentSearch" className="fw-semibold">nuestro directorio</Link>.
          </Alert>
        )}

        {!isLoading && agents.length > 0 && (
          <Row xs={1} md={2} lg={3} className="g-4">
            {agents.map((agent) => (
              <Col key={agent.agentClientId}>
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex align-items-start mb-3">
                      <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                        style={{ width: 56, height: 56, minWidth: 56 }}
                      >
                        {agent.agentAvatarUrl ? (
                          <img
                            src={agent.agentAvatarUrl}
                            alt={agent.agentName}
                            className="rounded-circle w-100 h-100 object-fit-cover"
                          />
                        ) : (
                          <span className="fs-5">{getInitials(agent.agentName)}</span>
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="mb-1 fw-semibold">{agent.agentName}</h5>
                        {agent.companyName && (
                          <p className="text-muted small mb-0">{agent.companyName}</p>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex align-items-center">
                        <span className="fw-bold text-warning me-1">
                          {agent.avgRating?.toFixed(1) || "0.0"}
                        </span>
                        <StarFill className="text-warning me-1" size={14} />
                        <span className="text-muted small">
                          ({agent.totalReviews || 0} reseñas)
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto d-grid gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/agents/${agent.agentId}`)}
                      >
                        Ver perfil
                      </Button>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() =>
                          setReviewModalAgent({
                            id: agent.agentId,
                            name: agent.agentName,
                          })
                        }
                      >
                        ★ Dejar reseña
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      <ReviewForm
        show={!!reviewModalAgent}
        onHide={() => setReviewModalAgent(null)}
        agentId={reviewModalAgent?.id}
        agentName={reviewModalAgent?.name}
        onSaved={() => setReviewModalAgent(null)}
      />

      <Footer />
    </>
  );
}
