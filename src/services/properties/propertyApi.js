import api from "../api";

const BASE = "/properties";

const propertyApi = {
  create: (payload) => api.post(BASE, payload),

  getById: (id) => api.get(`${BASE}/${id}`),

  getAll: (params) => api.get(BASE, { params }),

  getByOwner: (ownerId, params) => api.get(`${BASE}/owner/${ownerId}`, { params }),

  search: (keyword, params) => api.get(`${BASE}/search`, { params: { q: keyword, ...params } }),

  update: (id, payload) => api.put(`${BASE}/${id}`, payload),

  delete: (id) => api.delete(`${BASE}/${id}`),

  changeStatus: (id, newStatus) => api.patch(`${BASE}/${id}/status`, { newStatus }),

  trash: (id) => api.patch(`${BASE}/${id}/trash`),

  restore: (id) => api.patch(`${BASE}/${id}/restore`),

  getTrashcan: (params) => api.get(`${BASE}/trashcan`, { params }),
  
  clearTrashcan: (id) => api.post(`${BASE}/clear-trashcan`),

  getSimilar: (id, limit) => api.get(`${BASE}/${id}/similar?size=${limit}`),

};

export default propertyApi;
