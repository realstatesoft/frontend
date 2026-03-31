import api from './api';

const salesService = {
  getAll(params = {}) {
    return api.get('/dashboard/sales', { params }).then((res) => res.data);
  },

  getSummary() {
    return api.get('/dashboard/sales/summary').then((res) => res.data);
  },
};

export default salesService;
