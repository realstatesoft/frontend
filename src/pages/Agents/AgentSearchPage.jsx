/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import {
  StarFill,
  Search,
  XLg,
  Funnel,
  ChevronLeft,
  ChevronRight,
} from "react-bootstrap-icons";
import CustomNavbar from "../../components/Landing/Navbar";
import Footer from "../../components/Landing/Footer";
import agentApi from "../../services/agents/agentApi";
import "./AgentSearchPage.scss";

const PAGE_SIZE = 10;

export default function AgentSearchPage() {
  const navigate = useNavigate();

  // Server data
  const [agents, setAgents]               = useState([]);
  const [specialties, setSpecialties]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  // Server pagination state
  const [currentPage, setCurrentPage]     = useState(0);
  const [totalPages, setTotalPages]       = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Input state (pending, not yet applied)
  const [searchText, setSearchText]       = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [minRating, setMinRating]         = useState("");

  // Applied filters (what the backend is currently using)
  const [applied, setApplied] = useState({
    keyword:   "",
    specialty: "",
    minRating: "",
  });

  // ── Load specialties once ────────────────────────
  useEffect(() => {
    agentApi
      .getAllSpecialties()
      .then((res) => setSpecialties(res?.data ?? res ?? []))
      .catch((err) => console.error("Error loading specialties:", err));
  }, []);

  // ── Fetch from backend ──────────────────────────
  const fetchAgents = useCallback(async (filters, page = 0) => {
    try {
      setLoading(true);
      setError(null);

      const params = { page, size: PAGE_SIZE };
      if (filters.specialty) params.specialty = filters.specialty;
      if (filters.minRating) params.minRating  = filters.minRating;

      const res = await agentApi.searchAgents(
        filters.keyword || undefined,
        params
      );

      // Spring Boot 3.3+: { content, page: { totalPages, totalElements, number } }
      const pageObj  = res?.data ?? res;
      const pageMeta = pageObj?.page ?? pageObj;

      setAgents(pageObj?.content ?? []);
      setTotalPages(pageMeta?.totalPages    ?? 0);
      setTotalElements(pageMeta?.totalElements ?? 0);
      setCurrentPage(pageMeta?.number       ?? page);
    } catch (err) {
      console.error("Error fetching agents:", err);
      setError("No se pudieron cargar los agentes.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAgents(applied, 0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Apply all filters (triggered on Enter or button) ──
  const applyFilters = () => {
    const newFilters = {
      keyword:   searchText.trim(),
      specialty: selectedSpecialty,
      minRating: minRating,
    };
    setApplied(newFilters);
    fetchAgents(newFilters, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") applyFilters();
  };

  // ── Clear all filters ────────────────────────────
  const handleClearFilters = () => {
    setSearchText("");
    setSelectedSpecialty("");
    setMinRating("");
    const empty = { keyword: "", specialty: "", minRating: "" };
    setApplied(empty);
    fetchAgents(empty, 0);
  };

  // ── Remove one filter chip ───────────────────────
  const removeFilter = (key) => {
    const updated = { ...applied, [key]: "" };
    if (key === "keyword")   setSearchText("");
    if (key === "specialty") setSelectedSpecialty("");
    if (key === "minRating") setMinRating("");
    setApplied(updated);
    fetchAgents(updated, 0);
  };

  // ── Pagination ───────────────────────────────────
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchAgents(applied, newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleContactar = (agent) => navigate(`/agents/${agent.id}`);

  // ── Wizard mode: came from SellWizard step ───────
  // Detect synchronously so it never changes during the page lifecycle
  const isWizardMode = React.useRef(
    !!sessionStorage.getItem("wizardReturnStep")
  ).current;

  const handleSeleccionar = (agent) => {
    sessionStorage.setItem(
      "selectedAgentFromSearch",
      JSON.stringify({
        id:        agent.id,
        name:      agent.userName,
        avatarUrl: agent.userAvatarUrl ?? null,
      })
    );
    navigate("/sell");
  };

  const getInitials = (name) => {
    if (!name) return "A";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const hasFilters = applied.keyword || applied.specialty || applied.minRating;

  // ── Render ───────────────────────────────────────
  return (
    <div className="agent-search-page">
      <CustomNavbar />

      {/* Filter Bar */}
      <div className="search-filter-bar">
        <h1 className="search-title">Buscar un Agente</h1>

        <div className="filter-row">
          <div className="search-input-wrapper">
            <input
              id="agent-search-input"
              type="text"
              placeholder="Nombre, empresa, licencia"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <select
            id="filter-specialty"
            className="filter-select"
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            <option value="">Tipo ▾</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name
                  ? s.name.charAt(0).toUpperCase() + s.name.slice(1).toLowerCase()
                  : s}
              </option>
            ))}
          </select>

          <select
            id="filter-rating"
            className="filter-select"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
          >
            <option value="">Puntuación ▾</option>
            <option value="3">≥ 3.0</option>
            <option value="4">≥ 4.0</option>
            <option value="4.5">≥ 4.5</option>
          </select>

          <button
            id="search-btn"
            type="button"
            className="search-action-btn"
            onClick={applyFilters}
            title="Buscar"
          >
            <Search size={16} />
          </button>

          {hasFilters && (
            <button
              id="filter-reset"
              type="button"
              className="filter-reset-btn"
              onClick={handleClearFilters}
              title="Limpiar filtros"
            >
              <XLg size={14} />
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="active-filters">
            <span className="filters-label"><Funnel size={13} /> Filtros:</span>
            {applied.keyword && (
              <span className="filter-chip">
                &quot;{applied.keyword}&quot;
                <button className="chip-remove" onClick={() => removeFilter("keyword")}>✕</button>
              </span>
            )}
            {applied.specialty && (
              <span className="filter-chip">
                {applied.specialty.charAt(0).toUpperCase() + applied.specialty.slice(1).toLowerCase()}
                <button className="chip-remove" onClick={() => removeFilter("specialty")}>✕</button>
              </span>
            )}
            {applied.minRating && (
              <span className="filter-chip">
                ★ ≥ {applied.minRating}
                <button className="chip-remove" onClick={() => removeFilter("minRating")}>✕</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="agents-grid-container">
        {loading && (
          <div className="search-loading">
            <Spinner animation="border" variant="primary" />
            <p>Cargando agentes...</p>
          </div>
        )}

        {error && <div className="search-error">{error}</div>}

        {!loading && !error && agents.length === 0 && (
          <div className="search-empty">
            <Search size={48} />
            <h3>No se encontraron agentes</h3>
            <p>Intenta ajustar los filtros de búsqueda.</p>
          </div>
        )}

        {!loading && !error && agents.length > 0 && (
          <>
            <div className="search-results-info">
              Página {currentPage + 1} de {totalPages} — {totalElements} agentes
            </div>

            <div className="agents-grid">
              {agents.map((agent) => (
                <div key={agent.id} className="agent-search-card">
                  <div className="card-avatar">
                    {agent.userAvatarUrl ? (
                      <img src={agent.userAvatarUrl} alt={agent.userName} />
                    ) : (
                      <span className="initials">{getInitials(agent.userName)}</span>
                    )}
                  </div>

                  <div className="card-info">
                    <h3 className="card-name">{agent.userName}</h3>
                    <div className="card-details">
                      <span>{agent.companyName || "Agente independiente"}</span>
                      <span>{agent.experienceYears || 0} años de experiencia</span>
                    </div>
                  </div>

                  <div className="card-rating">
                    <span className="rating-score">
                      {agent.avgRating?.toFixed ? agent.avgRating.toFixed(1) : "0.0"}
                    </span>
                    <StarFill className="rating-star" />
                    <span className="rating-count">({agent.totalReviews || 0})</span>
                  </div>

                  <div className="card-actions">
                    {isWizardMode ? (
                      <button
                        type="button"
                        className="btn-contactar btn-seleccionar"
                        onClick={() => handleSeleccionar(agent)}
                      >
                        Seleccionar
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-contactar"
                        onClick={() => handleContactar(agent)}
                      >
                        Contactar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="search-pagination">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={currentPage === 0}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`pagination-page${i === currentPage ? " pagination-page--active" : ""}`}
                      onClick={() => handlePageChange(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
