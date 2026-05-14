import api from './api';

const tenantService = {
  getDashboard() {
    return api.get('/tenant/dashboard').then((res) => res.data.data);
  },

  getLease() {
    return api.get('/tenant/lease').then((res) => res.data.data);
  },

  getLeaseById(id) {
    return api.get(`/tenant/lease/${id}`).then((res) => res.data.data);
  },

  downloadLeasePdf(id) {
    return api.get(`/tenant/lease/${id}/pdf`, {
      responseType: 'blob',
    });
  },

  getPayments(page = 0, size = 12) {
    return api.get(`/tenant/payments?page=${page}&size=${size}`).then((res) => res.data.data);
  },

  getMaintenance(page = 0, size = 10) {
    return api.get(`/tenant/maintenance?page=${page}&size=${size}`).then((res) => res.data.data);
  },

  createMaintenanceRequest(data) {
    return api.post('/tenant/maintenance', data).then((res) => res.data.data);
  },

  rateMaintenanceRequest(id, rating) {
    return api.post(`/tenant/maintenance/${id}/rate`, { rating }).then((res) => res.data.data);
  },
};

export default tenantService;

