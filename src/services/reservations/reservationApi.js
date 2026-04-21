import api from '../api';

const reservationApi = {
  createReservation: (payload) => api.post('/reservations', payload),
  getById: (id) => api.get(`/reservations/${id}`),
  getMyReservations: (page = 0, size = 10) =>
    api.get(`/reservations/my?page=${page}&size=${size}`),
  getOwnerReservations: (page = 0, size = 10) =>
    api.get(`/reservations/owner?page=${page}&size=${size}`),
  getByProperty: (propertyId) => api.get(`/reservations/property/${propertyId}`),
  getMyForProperty: (propertyId) => api.get(`/reservations/my/property/${propertyId}`),
  confirm: (id) => api.post(`/reservations/${id}/confirm`),
  cancel: (id, payload) => api.post(`/reservations/${id}/cancel`, payload),
  convert: (id) => api.post(`/reservations/${id}/convert`),
};

export default reservationApi;