import { useState, useEffect, useCallback } from "react";
import { Modal, Button, Form, Spinner, Image } from "react-bootstrap";
import { searchAgents } from "../../services/api";
import propertyApi from "../../services/properties/propertyApi";
import Swal from "sweetalert2";

export default function AssignAgentModal({ propertyId, show, onHide, onAssigned }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isSearching = query.trim().length > 0;

  const loadSuggested = useCallback(async () => {
    try {
      const res = await searchAgents("");
      const data = res?.data ?? res?.content ?? [];
      setSuggested(data.slice(0, 5));
    } catch {
      setSuggested([]);
    }
  }, []);

  useEffect(() => {
    if (show) {
      setQuery("");
      setSelectedAgentId(null);
      setResults([]);
      loadSuggested();
    }
  }, [show, loadSuggested]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchAgents(query);
        const data = res?.data ?? res?.content ?? [];
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  async function handleSubmit() {
    if (!selectedAgentId) return;
    setSubmitting(true);
    try {
      await propertyApi.assignAgent(propertyId, selectedAgentId);
      Swal.fire({ icon: "success", title: "Solicitud enviada", text: "El agente recibirá una notificación", timer: 2000, showConfirmButton: false });
      onHide();
      if (onAssigned) onAssigned();
    } catch (err) {
      const msg = err.response?.data?.message || "Error al asignar agente";
      Swal.fire({ icon: "error", title: "Error", text: msg });
    } finally {
      setSubmitting(false);
    }
  }

  function getInitials(name) {
    if (!name) return "?";
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  function renderAgentCard(agent) {
    const agentId = agent.id;
    const name = agent.userName || "Sin nombre";
    const avatar = agent.userAvatarUrl;
    const rating = agent.avgRating;
    const reviews = agent.totalReviews;
    return (
      <div
        key={agentId}
        className={`d-flex align-items-center gap-3 p-2 rounded ${selectedAgentId === agentId ? "bg-primary bg-opacity-10 border border-primary" : "border"}`}
        onClick={() => setSelectedAgentId(agentId)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") setSelectedAgentId(agentId); }}
        style={{ cursor: "pointer", marginBottom: 6 }}
      >
        {avatar ? (
          <Image src={avatar} roundedCircle width={36} height={36} />
        ) : (
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold"
            style={{ width: 36, height: 36, backgroundColor: "#0d6efd", fontSize: 14, flexShrink: 0 }}
          >
            {getInitials(name)}
          </div>
        )}
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <div className="fw-semibold text-truncate">{name}</div>
          {rating != null && (
            <small className="text-muted">
              {"★".repeat(Math.round(rating))} {rating.toFixed(1)} ({reviews ?? 0} reseñas)
            </small>
          )}
        </div>
        <Button
          size="sm"
          variant={selectedAgentId === agentId ? "primary" : "outline-primary"}
          onClick={(e) => { e.stopPropagation(); setSelectedAgentId(agentId); }}
        >
          {selectedAgentId === agentId ? "Seleccionado" : "Seleccionar"}
        </Button>
      </div>
    );
  }

  const displayList = isSearching ? results : suggested;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Asignar agente a la propiedad</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "60vh", overflowY: "auto" }}>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Buscar agente por nombre..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Form.Group>

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" />
            <p className="text-muted mt-2 mb-0">Buscando agentes...</p>
          </div>
        ) : displayList.length > 0 ? (
          displayList.map(renderAgentCard)
        ) : (
          <p className="text-muted text-center py-3">
            {isSearching ? "No se encontraron agentes" : "Cargando agentes sugeridos..."}
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!selectedAgentId || submitting}>
          {submitting ? <><Spinner size="sm" className="me-1" /> Asignando...</> : "Asignar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
