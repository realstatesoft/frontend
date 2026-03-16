import api from "../api";

const BASE = "/locations";

const locationApi = {
  /** Lista todas las ubicaciones disponibles */
  getAll: () => api.get(BASE),

  /** Busca ubicaciones por nombre de ciudad */
  matchByCity: (city) => api.get(`${BASE}/match`, { params: { city } }),

  /** Busca o crea una ubicación a partir de datos de Nominatim */
  findOrCreate: (city, department, country = "Paraguay", lat, lng) =>
    api.post(`${BASE}/find-or-create`, null, {
      params: { city, department, country, ...(lat && lng && { lat, lng }) },
    }),
};

export default locationApi;
