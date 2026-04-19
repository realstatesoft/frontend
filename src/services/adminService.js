import api from './api';

const adminService = {
  getDashboardOverview() {
    return api.get('/admin/dashboard').then((res) => res.data);
  },

  /**
   * @param {Record<string, string|number|undefined>} params query params (page, size, sort, userId, userSearch, entityType, entityId, action, from, to)
   */
  getAuditLogs(params) {
    return api.get('/admin/audit-logs', { params }).then((res) => res.data);
  },

  /**
   * Opciones para el selector de entidad en filtros de auditoría (ADMIN).
   * @param {{ entityType: string, q?: string, limit?: number }} opts
   */
  getAuditLogEntityOptions({ entityType, q, limit = 40 }) {
    const params = { entityType, limit };
    const trimmed = q != null ? String(q).trim() : '';
    if (trimmed !== '') params.q = trimmed;
    return api.get('/admin/audit-logs/entity-options', { params }).then((res) => res.data);
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
