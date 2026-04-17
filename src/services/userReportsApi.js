import api from './api';

/**
 * Servicio de reportes de usuarios.
 * Sigue el mismo patrón que propertyFlagsApi.js.
 */
const userReportsApi = {
  /**
   * Crea un nuevo reporte de usuario.
   * @param {{ reportedUserId: number; reason: string; description?: string }} data
   */
  createUserReport(data) {
    return api.post('/user-reports', data).then((res) => res.data);
  },

  /**
   * Obtiene la lista de reportes de usuarios (admin).
   * @param {{ status?: string; page?: number }} [params]
   */
  getUserReports(params) {
    return api.get('/user-reports', { params }).then((res) => res.data);
  },

  /**
   * Actualiza el estado de un reporte.
   * @param {number} reportId
   * @param {string} status
   */
  updateUserReportStatus(reportId, status) {
    return api.put(`/user-reports/${reportId}/status`, { status }).then((res) => res.data);
  },
};

export default userReportsApi;
