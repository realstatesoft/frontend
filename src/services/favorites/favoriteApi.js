import api from "../api";

const BASE = "/favorites";

const favoriteApi = {
  add: (propertyId) => api.post(`${BASE}/${propertyId}`),
  remove: (propertyId) => api.delete(`${BASE}/${propertyId}`),
  getMy: (params) => api.get(`${BASE}/me`, { params }),
};

export default favoriteApi;
