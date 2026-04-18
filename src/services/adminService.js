import api from './api';

const adminService = {
  getDashboardOverview() {
    return api.get('/admin/dashboard').then((res) => res.data);
  },

  /**
   * Suspende a un usuario.
   * @param {number} userId
   * @param {{ suspendedUntil: string | null; suspensionReason: string }} data
   */
  suspendUser(userId, data) {
    return api.put(`/users/${userId}/suspend`, data).then((res) => res.data);
  },

  /**
   * Levanta la suspensión de un usuario.
   * @param {number} userId
   */
  unsuspendUser(userId) {
    return api.put(`/users/${userId}/unsuspend`).then((res) => res.data);
  },
};

export default adminService;
