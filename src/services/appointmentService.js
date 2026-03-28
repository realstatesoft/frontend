import api from './api';

const appointmentService = {
  getAll(params = {}) {
    // Convert date params to yyyy-MM if needed, or handle in component
    return api.get('/agent-agenda', { params }).then((res) => res.data);
  },

  getById(id) {
    return api.get(`/agent-agenda/${id}`).then((res) => res.data);
  },
};

export default appointmentService;
