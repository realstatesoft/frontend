import AgentCard from "./AgentCard";

export default function AgentList({ agents, onSelectAgent }) {
  return (
    <section>
      <div className="row g-3">
        {agents.map((agent) => (
          <div className="col-12 col-lg-6" key={agent.id}>
            <AgentCard agent={agent} onSelect={onSelectAgent} />
          </div>
        ))}
      </div>
    </section>
  );
}
