import api from "../api";

/**
 * Obtiene agentes sugeridos basados en criterios de la propiedad.
 * @param {Object} params - Parámetros de búsqueda
 * @param {string} [params.propertyType] - Tipo de propiedad (HOUSE, APARTMENT, LAND, etc.)
 * @param {string} [params.category] - Categoría (SALE, RENT, SALE_OR_RENT)
 * @param {string} [params.city] - Ciudad o zona
 * @param {number} [params.locationId] - ID de ubicación
 * @param {number} [params.limit=5] - Cantidad máxima de agentes
 * @returns {Promise<Array>} Lista de agentes sugeridos
 */
export async function getSuggestedAgents(params = {}) {
  const response = await api.get("/agents/suggested", { params });
  // ApiResponse → { success, data: [...], message }
  return response.data?.data ?? response.data ?? [];
}

/**
 * Obtiene todos los agentes paginados.
 * @param {Object} params - Parámetros de paginación
 * @returns {Promise<Object>} Página de agentes
 */
export async function getAllAgents(params = {}) {
  const response = await api.get("/agents", { params });
  return response.data;
}

/**
 * Obtiene un agente por ID.
 * @param {number} id - ID del agente
 * @returns {Promise<Object>} Datos del agente
 */
export async function getAgentById(id) {
  const response = await api.get(`/agents/${id}`);
  return response.data;
}

/**
 * Busca agentes por keyword.
 * @param {string} keyword - Palabra clave de búsqueda
 * @param {Object} params - Parámetros de paginación
 * @returns {Promise<Object>} Página de agentes
 */
export async function searchAgents(keyword, params = {}) {
  const response = await api.get("/agents/search", { 
    params: { q: keyword, ...params } 
  });
  return response.data;
}

export default {
  getSuggestedAgents,
  getAllAgents,
  getAgentById,
  searchAgents,
};
