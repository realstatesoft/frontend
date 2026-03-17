import api from "../api";

/**
 * Obtiene el perfil de un cliente por ID.
 * @param {number} id - ID del AgentClient
 * @returns {Promise<Object>} Datos del cliente
 */
export async function getClientProfile(id) {
  const response = await api.get(`/agent-clients/${id}`);
  return response.data?.data ?? response.data;
}

/**
 * Actualiza parcialmente un cliente.
 * @param {number} id - ID del AgentClient
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Cliente actualizado
 */
export async function updateClientProfile(id, data) {
  const response = await api.put(`/agent-clients/${id}`, data);
  return response.data?.data ?? response.data;
}

export default {
  getClientProfile,
  updateClientProfile,
};
