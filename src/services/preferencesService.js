import api from "./api";

/**
 * Obtiene la lista de categorías y opciones disponibles.
 * GET /preferences/options
 * @returns {Promise<import('../types/preferences').PreferenceCategory[]>}
 */
export async function getPreferenceOptions() {
  const response = await api.get("/preferences/options");
  return response.data?.data ?? response.data ?? [];
}

/**
 * Obtiene las preferencias guardadas de un usuario.
 * GET /preferences/{userId}
 * @param {number} userId
 * @returns {Promise<import('../types/preferences').UserPreferenceResponse>}
 */
export async function getUserPreferences(userId) {
  const response = await api.get(`/preferences/${userId}`);
  return response.data?.data ?? response.data;
}

/**
 * Guarda o actualiza las preferencias del usuario (upsert).
 * POST /preferences
 * @param {import('../types/preferences').UserPreferenceRequest} data
 * @returns {Promise<import('../types/preferences').UserPreferenceResponse>}
 */
export async function saveUserPreferences(data) {
  const response = await api.post("/preferences", data);
  return response.data?.data ?? response.data;
}
