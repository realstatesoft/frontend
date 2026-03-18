import { getAgent, listAgents, updateAgent } from "./agentMockStore";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(str) {
  return String(str || "").trim().toLowerCase();
}

function matchesQuery(agent, q) {
  if (!q) return true;
  const hay = [
    agent.name,
    agent.role,
    agent.company,
    agent.city,
    agent.department,
    ...(agent.specializations || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

function hasSpecialization(agent, tag) {
  if (!tag) return true;
  return (agent.specializations || [])
    .map((item) => normalize(item))
    .includes(tag);
}

function paginate(items, page, pageSize) {
  const safePageSize = Math.max(1, Number(pageSize) || 12);
  const safePage = Math.max(1, Number(page) || 1);
  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;
  return {
    page: safePage,
    pageSize: safePageSize,
    total: items.length,
    items: items.slice(start, end),
  };
}

/**
 * Mock: busca agentes (simula GET /agents/search o /agents).
 * Parámetros compatibles con tu UI:
 * - q: texto libre (nombre/ciudad/depto/empresa/especialidades)
 * - type: tag de especialización (ej: rentas, casas, departamentos)
 * - minRating: número 1..5 (rating mínimo)
 * - page, pageSize: paginación
 * - sort: 'rating_desc' | 'reviews_desc' | 'name_asc'
 */
export async function searchAgentsMock(params = {}) {
  const {
    q,
    type,
    minRating,
    page = 1,
    pageSize = 12,
    sort = "rating_desc",
    delayMs = 350,
  } = params;

  await sleep(delayMs);

  const qn = normalize(q);
  const typeN = normalize(type);
  const minRatingN = Number(minRating || 0);

  let results = listAgents()
    .filter((a) => matchesQuery(a, qn))
    .filter((a) => hasSpecialization(a, typeN))
    .filter((a) => a.rating >= minRatingN);

  if (sort === "reviews_desc") {
    results = results.slice().sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
  } else if (sort === "name_asc") {
    results = results.slice().sort((a, b) => a.name.localeCompare(b.name));
  } else {
    results = results
      .slice()
      .sort((a, b) => b.rating - a.rating || (b.reviews || 0) - (a.reviews || 0));
  }

  return paginate(results, page, pageSize);
}

/**
 * Mock: obtiene agente por id (simula GET /agents/:id).
 */
export async function getAgentByIdMock(id, { delayMs = 250 } = {}) {
  await sleep(delayMs);
  return getAgent(id);
}

/**
 * Mock: "actualiza" un agente (no persiste, solo devuelve lo que recibirías del backend).
 * Útil para la pantalla de edición.
 */
export async function updateAgentMock(id, patch = {}, { delayMs = 400 } = {}) {
  await sleep(delayMs);
  return updateAgent(id, patch);
}

export default {
  searchAgentsMock,
  getAgentByIdMock,
  updateAgentMock,
};
