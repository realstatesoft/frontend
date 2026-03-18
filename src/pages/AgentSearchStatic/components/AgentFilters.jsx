import { TYPE_OPTIONS } from "../data";

const FILTER_TAGS = ["Encarnación, Itapúa"];

export default function AgentFilters({
  locationText,
  onChangeLocationText,
  typeValue,
  onChangeTypeValue,
  minRating,
  onChangeMinRating,
}) {
  return (
    <section className="mb-4">
      <div className="d-flex flex-column gap-3">
        <div className="flex-grow-1">
          <input
            type="text"
            className="form-control form-control-lg rounded-pill shadow-sm border-0"
            placeholder="Ciudad, Departamento"
            value={locationText}
            onChange={(e) => onChangeLocationText(e.target.value)}
          />
        </div>

        <div className="d-flex flex-column flex-md-row gap-3">
          <div className="w-100">
            <select
              className="form-select rounded-pill px-4"
              value={typeValue}
              onChange={(e) => onChangeTypeValue(e.target.value)}
              aria-label="Tipos"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-100">
            <select
              className="form-select rounded-pill px-4"
              value={minRating}
              onChange={(e) => onChangeMinRating(e.target.value)}
              aria-label="Puntuación"
            >
              <option value="" disabled>
                Puntuación
              </option>
              <option value="0">Todas</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n}★ o más
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-pill px-4 d-flex align-items-center gap-2"
          >
            <span className="fw-semibold">Más Opciones</span>
          </button>

          <div className="d-flex flex-wrap gap-2 align-items-center">
            {FILTER_TAGS.map((tag) => (
              <span
                key={tag}
                className="badge bg-light text-dark border rounded-pill px-3 py-2 d-flex align-items-center gap-2"
              >
                <span>{tag}</span>
                <span className="fw-bold" style={{ cursor: "pointer" }}>
                  ✕
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
