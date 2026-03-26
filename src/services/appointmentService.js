import api from './api';

const appointmentService = {
  getAll(params = {}) {
    return api.get('/appointments', { params }).then((res) => res.data);
  },

  getById(id) {
    return api.get(`/appointments/${id}`).then((res) => res.data);
  },
};

export default appointmentService;
