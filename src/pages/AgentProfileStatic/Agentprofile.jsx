import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CustomNavbar from "../../components/Landing/Navbar";
import StarRating from "../AgentSearchStatic/components/StarRating";
import AgentStatCard from "./components/AgentStatCard";
import SpecializationTags from "./components/SpecializationTags";
import PersonPlaceholder from "../../assets/person.png";
import { getAgentByIdMock } from "../../services/agents/agentMockApi";

function formatCurrency(value) {
  try {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$ ${value}`;
  }
}

export default function AgentProfile() {
  const { id } = useParams();
  const agentId = id ?? "1";

  const [agent, setAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError("");
        const a = await getAgentByIdMock(agentId);
        if (cancelled) return;
        setAgent(a);
      } catch (e) {
        if (cancelled) return;
        setError(
          e instanceof Error ? e.message : "Ocurrió un error al cargar el perfil."
        );
        setAgent(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  return (
    <div className="min-vh-100 bg-light">
      <CustomNavbar />

      <main className="container py-3 py-md-4">
        <div className="mb-2">
          <Link to="/AgentSearch" className="text-decoration-none">
            ← Volver a búsqueda
          </Link>
        </div>

        {isLoading ? (
          <div className="text-muted">Cargando perfil…</div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : !agent ? (
          <div className="alert alert-warning">
            No se encontró el agente solicitado.
          </div>
        ) : (
          <>
            <section className="bg-white rounded-4 shadow-sm p-4 p-md-5 mb-4">
              <div className="d-flex flex-column flex-lg-row gap-4 align-items-start">
                <div className="d-flex gap-3 align-items-center flex-grow-1">
                  <img
                    src={agent.photoUrl || PersonPlaceholder}
                    alt="Foto del agente"
                    className="rounded-circle"
                    style={{
                      width: "88px",
                      height: "88px",
                      objectFit: "cover",
                      flex: "0 0 auto",
                    }}
                  />

                  <div>
                    <h2 className="fw-bold mb-1">{agent.name}</h2>
                    <div className="text-muted">
                      {agent.role} • {agent.company}
                    </div>
                    {agent.email ? (
                      <div className="text-muted small">{agent.email}</div>
                    ) : null}
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <StarRating value={agent.rating} />
                  <span className="fw-semibold">{agent.rating.toFixed(1)}</span>
                  <span className="text-muted small">
                    ({agent.reviews} reseñas)
                  </span>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-3 mt-4">
                <AgentStatCard
                  value={agent.sold}
                  label="Vendidas"
                  bgClassName="bg-primary-subtle"
                />
                <AgentStatCard
                  value={agent.rented}
                  label="Alquiladas"
                  bgClassName="bg-success-subtle"
                />
                <AgentStatCard
                  value={agent.sold + agent.rented}
                  label="Total"
                  bgClassName="bg-secondary-subtle"
                />
                <AgentStatCard
                  value={formatCurrency(agent.avgRentPrice)}
                  label="Precio promedio (alquiladas)"
                  bgClassName="bg-warning-subtle"
                />
              </div>

              <div className="d-flex flex-wrap gap-3 mt-4">
                <button type="button" className="btn btn-primary rounded-pill px-4">
                  Enviar Mensaje
                </button>
                <div className="d-flex align-items-center px-2 text-muted">
                  +595 985 666211
                </div>
              </div>
            </section>

            <section className="bg-white rounded-4 shadow-sm p-4 p-md-5">
              <p className="text-muted mb-4">
                {agent.bio ||
                  "Soy un agente inmobiliario enfocado en brindar una experiencia clara y segura en cada etapa del proceso."}
              </p>
              <div className="fw-semibold mb-2">Especializaciones</div>
              <SpecializationTags tags={agent.specializations || []} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

