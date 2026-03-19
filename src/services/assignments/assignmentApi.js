import api from "../api";

/**
 * Acepta una asignación de propiedad.
 * @param {number} assignmentId - ID de la asignación
 * @param {string} [token] - Token de validación (del link del email)
 * @returns {Promise<Object>}
 */
export async function acceptAssignment(assignmentId, token) {
  const params = token ? { token } : {};
  const response = await api.put(`/assignments/${assignmentId}/accept`, null, { params });
  return response.data?.data ?? response.data;
}

/**
 * Rechaza una asignación de propiedad.
 * @param {number} assignmentId
 * @param {string} [token]
 * @returns {Promise<Object>}
 */
export async function rejectAssignment(assignmentId, token) {
  const params = token ? { token } : {};
  const response = await api.put(`/assignments/${assignmentId}/reject`, null, { params });
  return response.data?.data ?? response.data;
}

/**
 * Lista las asignaciones del agente autenticado.
 * @returns {Promise<Object[]>}
 */
export async function getMyAssignments() {
  const response = await api.get("/assignments/me");
  return response.data?.data ?? response.data;
}

/**
 * Lista las asignaciones de una propiedad.
 * @param {number} propertyId
 * @returns {Promise<Object[]>}
 */
export async function getPropertyAssignments(propertyId) {
  const response = await api.get(`/properties/${propertyId}/assignments`);
  return response.data?.data ?? response.data;
}

/**
 * Crea una asignación (owner asigna agente a propiedad).
 * @param {number} propertyId
 * @param {number} agentProfileId
 * @returns {Promise<Object>}
 */
export async function assignProperty(propertyId, agentProfileId) {
  const response = await api.post(`/properties/${propertyId}/assignments`, { agentProfileId });
  return response.data?.data ?? response.data;
}

/**
 * Revoca una asignación (owner revoca).
 * @param {number} assignmentId
 * @returns {Promise<Object>}
 */
export async function revokeAssignment(assignmentId) {
  const response = await api.put(`/assignments/${assignmentId}/revoke`);
  return response.data?.data ?? response.data;
}

export default {
  acceptAssignment,
  rejectAssignment,
  getMyAssignments,
  getPropertyAssignments,
  assignProperty,
  revokeAssignment,
};
