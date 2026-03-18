import { useEffect, useState } from "react";
import CustomNavbar from "../../components/Landing/Navbar";
import AgentFilters from "./components/AgentFilters";
import AgentList from "./components/AgentList";
import { searchAgentsMock } from "../../services/agents/agentMockApi";


export default function AgentSearch() {
  const [locationText, setLocationText] = useState("");
  const [typeValue, setTypeValue] = useState("");
  const [minRating, setMinRating] = useState("");
  const [agents, setAgents] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function onSelectAgent(agent) {
    if (!agent) return;
    window.alert(`Agente seleccionado: ${agent.name}`);
  }

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError("");
        const res = await searchAgentsMock({
          q: locationText,
          type: typeValue,
          minRating: minRating === "" ? 0 : Number(minRating),
          page: 1,
          pageSize: 12,
          sort: "rating_desc",
        });
        if (cancelled) return;
        setAgents(res.items);
        setTotal(res.total);
      } catch (e) {
        if (cancelled) return;
        setError(
          e instanceof Error ? e.message : "Ocurrió un error al cargar agentes."
        );
        setAgents([]);
        setTotal(0);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [locationText, minRating, typeValue]);

  return (
    <div className="min-vh-100 bg-light">
      <CustomNavbar />

      <main className="container py-4 py-md-5">
        <h1 className="fw-bold mb-4">Buscar un Agente</h1>

        <AgentFilters
          locationText={locationText}
          onChangeLocationText={setLocationText}
          typeValue={typeValue}
          onChangeTypeValue={setTypeValue}
          minRating={minRating}
          onChangeMinRating={setMinRating}
        />

        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="small text-muted">
            {isLoading ? "Buscando..." : `Mostrando ${agents.length} de ${total}`}
          </div>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        <AgentList agents={agents} onSelectAgent={onSelectAgent} />
      </main>
    </div>
  );
}
