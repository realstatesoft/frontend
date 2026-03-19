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

/**
 * Obtiene lista paginada de clientes filtrados.
 * @param {Object} params - Parámetros: q, status, clientType, createdAtFrom, createdAtTo, page, size, sort
 * @returns {Promise<Object>} Resultado paginado
 */
export async function searchClients(params) {
  const response = await api.get("/clients", { params });
  return response.data?.data ?? response.data;
}

/**
 * Elimina (soft-delete) un cliente
 * @param {number} id - ID del cliente
 * @returns {Promise<void>}
 */
export async function deleteClient(id) {
  await api.delete(`/clients/${id}`);
}

/**
 * Descarga el listado filtrado de clientes en formato CSV
 * @param {Object} params - Parámetros: q, status, clientType, createdAtFrom, createdAtTo, sort
 * @returns {Promise<Blob>} Archivo blob csv
 */
export async function exportClients(params) {
  const response = await api.get("/clients/export", {
    params,
    responseType: "blob",
  });
  return response.data;
}

export default {
  getClientProfile,
  updateClientProfile,
  searchClients,
  deleteClient,
  exportClients,
};
