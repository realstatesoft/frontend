import api from "../api";

const BASE = "/properties";

const propertyApi = {
  create: (payload) => api.post(BASE, payload),

  getById: (id) => api.get(`${BASE}/${id}`),

  registerView: (id) => api.post(`${BASE}/${id}/views`),

  getViewCount: (id) => api.get(`${BASE}/${id}/views/count`),

  getAll: (params) => api.get(BASE, { params }),

  compare: (ids) => api.get(`${BASE}/compare`, { params: { ids: ids.join(",") } }),

  getByOwner: (ownerId, params) => api.get(`${BASE}/owner/${ownerId}`, { params }),

  getMe: (params) => api.get(`${BASE}/me`, { params }),

  search: (keyword, params) => api.get(`${BASE}/search`, { params: { q: keyword, ...params } }),

  update: (id, payload) => api.put(`${BASE}/${id}`, payload),

  delete: (id) => api.delete(`${BASE}/${id}`),

  changeStatus: (id, newStatus) => api.patch(`${BASE}/${id}/status`, { newStatus }),

  toggleHighlight: (id, highlighted) => api.patch(`${BASE}/${id}/highlight`, null, { params: { highlighted } }),

  trash: (id) => api.patch(`${BASE}/${id}/trash`),

  restore: (id) => api.patch(`${BASE}/${id}/restore`),

  getTrashcan: (params) => api.get(`${BASE}/trashcan`, { params }),
  
  clearTrashcan: (id) => api.post(`${BASE}/clear-trashcan`),

  getSimilar: (id, limit) => api.get(`${BASE}/${id}/similar?size=${limit}`),

  registerRecentView: (id) => api.post(`${BASE}/${id}/recent-views`),

  getRecentProperties: () => api.get("/users/me/recent-properties"),

  /** Estado de asignación de una propiedad (owner) */
  getAssignmentStatus: (propertyId) => api.get(`/properties/${propertyId}/assignment-status`),

  /** Asignar agente a una propiedad (owner) */
  assignAgent: (propertyId, agentProfileId) =>
    api.post(`/properties/${propertyId}/assignments`, { agentProfileId }),

  /** Revocar asignación (owner) */
  revokeAssignment: (assignmentId) =>
    api.put(`/assignments/${assignmentId}/revoke`),

  /** Aceptar asignación (agent) */
  acceptAssignment: (assignmentId) =>
    api.put(`/assignments/${assignmentId}/accept`),

  /** Rechazar asignación (agent) */
  rejectAssignment: (assignmentId) =>
    api.put(`/assignments/${assignmentId}/reject`),

  /** Propiedades asignadas al agente autenticado (solo AGENT) */
  getMyAssignments: () => api.get("/assignments/me"),

  /** Propiedades del agente (Scope completo: asignadas + clientes) */
  getAgentScope: (params) => api.get(`${BASE}/agent/me`, { params }),

  /** Marca la propiedad como destacada (requiere pago previo aprobado) */
  highlight: (id) => api.post(`${BASE}/${id}/highlight`),

  /** Quita el destacado de una propiedad */
  removeHighlight: (id) => api.delete(`${BASE}/${id}/highlight`),
};

export default propertyApi;
