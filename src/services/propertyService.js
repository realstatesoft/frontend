import api from './api';

const propertyService = {
  getAll(params = {}) {
    return api.get('/properties', { params }).then((res) => res.data);
  },

  getAgentScope(params = {}) {
    return api.get('/properties/agent/me', { params }).then((res) => res.data);
  },

  getById(id) {
    return api.get(`/properties/${id}`).then((res) => res.data);
  },
};

export default propertyService;
