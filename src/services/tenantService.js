import api from './api';

const tenantService = {
  getDashboard() {
    return api.get('/tenant/dashboard').then((res) => res.data.data);
  },

  getLease() {
    return api.get('/tenant/lease').then((res) => res.data.data);
  },
};

export default tenantService;
