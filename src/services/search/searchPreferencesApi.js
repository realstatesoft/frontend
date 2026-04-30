import api from "../api";

const BASE = "search-preferences";

export const searchPreferencesApi = {
  create: (data) => api.post(BASE, data).then(res => res.data),

  getMine: (params) => api.get(`${BASE}/me`, { params }).then(res => res.data),

  update: (id, data) => api.put(`${BASE}/${id}`, data).then(res => res.data),

  delete: (id) => api.delete(`${BASE}/${id}`).then(res => res.data),
};

export default searchPreferencesApi;