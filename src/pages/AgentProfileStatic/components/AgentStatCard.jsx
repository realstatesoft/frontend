export default function AgentStatCard({ value, label, bgClassName }) {
  return (
    <div
      className={`rounded-3 px-3 py-2 text-center ${bgClassName || "bg-light"}`}
      style={{ minWidth: "110px" }}
    >
      <div className="fw-bold">{value}</div>
      <div className="small text-muted">{label}</div>
    </div>
  );
}

