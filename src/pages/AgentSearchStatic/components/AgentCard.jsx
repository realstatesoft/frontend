import StarRating from "./StarRating";
import { Link } from "react-router-dom";
import PersonPlaceholder from "../../../assets/person.png";

export default function AgentCard({ agent, onSelect }) {
  return (
    <article
      className="d-flex align-items-center p-3 rounded-4 shadow-sm bg-white"
      style={{ minHeight: "120px" }}
    >
      <div className="me-3">
        <img
          src={agent.photoUrl || PersonPlaceholder}
          alt="Foto del agente"
          className="rounded-circle"
          style={{ width: "64px", height: "64px", objectFit: "cover" }}
        />
      </div>

      <div className="flex-grow-1">
        <h5 className="mb-1 fw-semibold">{agent.name}</h5>
        <p className="mb-0 text-muted small">{agent.priceRange}</p>
        <p className="mb-0 text-muted small">{agent.stats}</p>
      </div>

      <div className="d-flex flex-column align-items-end gap-2 ms-3">
        <div className="d-flex align-items-center gap-1">
          <span className="fw-semibold">{agent.rating.toFixed(1)}</span>
          <StarRating value={agent.rating} />
          <span className="text-muted small">({agent.reviews})</span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-primary rounded-pill px-4 py-1 small"
            onClick={() => onSelect?.(agent)}
          >
            Seleccionar
          </button>
          <Link
            to={`/AgentProfile/${agent.id}`}
            className="btn btn-outline-secondary rounded-pill px-4 py-1 small"
          >
            Contactar
          </Link>
        </div>
      </div>
    </article>
  );
}
