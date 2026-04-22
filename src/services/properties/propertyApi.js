import api from "../api";

const BASE = "/properties";

const propertyApi = {
  create: (payload) => api.post(BASE, payload),

  getById: (id) => api.get(`${BASE}/${id}`),

  getAll: (params) => api.get(BASE, { params }),

  getByOwner: (ownerId, params) => api.get(`${BASE}/owner/${ownerId}`, { params }),

  getMe: (params) => api.get(`${BASE}/me`, { params }),

  search: (keyword, params) => api.get(`${BASE}/search`, { params: { q: keyword, ...params } }),

  update: (id, payload) => api.put(`${BASE}/${id}`, payload),

  delete: (id) => api.delete(`${BASE}/${id}`),

  changeStatus: (id, newStatus) => api.patch(`${BASE}/${id}/status`, { newStatus }),

  trash: (id) => api.patch(`${BASE}/${id}/trash`),

  restore: (id) => api.patch(`${BASE}/${id}/restore`),

  getTrashcan: (params) => api.get(`${BASE}/trashcan`, { params }),
  
  clearTrashcan: (id) => api.post(`${BASE}/clear-trashcan`),

  getSimilar: (id, limit) => api.get(`${BASE}/${id}/similar?size=${limit}`),

  registerRecentView: (id) => api.post(`${BASE}/${id}/recent-views`),

  getRecentProperties: () => api.get("/users/me/recent-properties"),

  /** Propiedades asignadas al agente autenticado (solo AGENT) */
  getMyAssignments: () => api.get("/assignments/me"),

  /** Propiedades del agente (Scope completo: asignadas + clientes) */
  getAgentScope: (params) => api.get(`${BASE}/agent/me`, { params }),
};

export default propertyApi;
