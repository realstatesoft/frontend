import api from './api';

const settingsService = {
  getAdminSettings() {
    return api.get('/settings/admin').then((res) => res.data);
  },
  updateAdminCommissions(payload) {
    return api.put('/settings/admin/commissions', payload).then((res) => res.data);
  },
  updateAdminReservations(payload) {
    return api.put('/settings/admin/reservations', payload).then((res) => res.data);
  },
  updateAdminProperties(payload) {
    return api.put('/settings/admin/properties', payload).then((res) => res.data);
  },
  updateAdminSystem(payload) {
    return api.put('/settings/admin/system', payload).then((res) => res.data);
  },

  getAgentSettings() {
    return api.get('/settings/agent').then((res) => res.data);
  },
  updateAgentSettings(payload) {
    return api.put('/settings/agent', payload).then((res) => res.data);
  },

  getUserSettings() {
    return api.get('/settings/user').then((res) => res.data);
  },
  updateUserSettings(payload) {
    return api.put('/settings/user', payload).then((res) => res.data);
  },
};

export default settingsService;
