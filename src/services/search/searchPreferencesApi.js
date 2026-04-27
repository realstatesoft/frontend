import api from "../api";

const BASE = "/search-preferences";

export const searchPreferencesApi = {
  create: (data) => api.post(BASE, data),

  getMine: (params) => api.get(`${BASE}/me`, { params }),

  update: (id, data) => api.put(`${BASE}/${id}`, data),

  delete: (id) => api.delete(`${BASE}/${id}`),
};

export default searchPreferencesApi;