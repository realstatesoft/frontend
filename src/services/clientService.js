import api from './api';

const clientService = {
  getAll(params = {}) {
    return api.get('/clients', { params }).then((res) => res.data);
  },

  getById(id) {
    return api.get(`/clients/${id}`).then((res) => res.data);
  },
};

export default clientService;
