import { MOCK_AGENTS } from "./mockAgentsData";

const STORAGE_KEY = "mock_agents_store_v1";

function normalizeAgent(a) {
  return {
    email: a.email ?? "",
    nickName: a.nickName ?? "",
    gender: a.gender ?? "",
    country: a.country ?? "Paraguay",
    languages: Array.isArray(a.languages) ? a.languages : ["Español"],
    timeZone: a.timeZone ?? "UTC -03:00",
    bio: a.bio ?? "",
    photoUrl: a.photoUrl ?? "",
    ...a,
  };
}

function buildDefaultAgents() {
  return MOCK_AGENTS.map(normalizeAgent);
}

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function persistAgents(nextAgents) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAgents));
}

function loadAgents() {
  if (!canUseStorage()) return buildDefaultAgents();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefaultAgents();

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return buildDefaultAgents();

    return parsed
      .filter((a) => a && typeof a === "object" && a.id != null)
      .map(normalizeAgent);
  } catch {
    return buildDefaultAgents();
  }
}

let agents = loadAgents();

export function resetAgentsMockStore() {
  agents = buildDefaultAgents();
  persistAgents(agents);
}

export function listAgents() {
  return agents.map((a) => ({ ...a }));
}

export function getAgent(id) {
  const agentId = Number(id);
  const a = agents.find((x) => x.id === agentId);
  return a ? { ...a } : null;
}

export function updateAgent(id, patch = {}) {
  const agentId = Number(id);
  const idx = agents.findIndex((x) => x.id === agentId);
  if (idx === -1) return null;
  agents[idx] = normalizeAgent({ ...agents[idx], ...patch, id: agentId });
  persistAgents(agents);
  return { ...agents[idx] };
}
