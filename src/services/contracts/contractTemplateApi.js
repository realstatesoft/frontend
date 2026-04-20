import api from '../api';

function unwrap(res) {
  const body = res?.data;
  return body?.data !== undefined ? body.data : body;
}

const contractTemplateApi = {
  /** ADMIN: listado con filtros opcionales */
  listAdmin(params) {
    return api.get('/contract-templates', { params }).then(unwrap);
  },

  /** ADMIN: detalle para edición */
  getById(id) {
    return api.get(`/contract-templates/${id}`).then(unwrap);
  },

  create(payload) {
    return api.post('/contract-templates', payload).then(unwrap);
  },

  update(id, payload) {
    return api.put(`/contract-templates/${id}`, payload).then(unwrap);
  },

  softDelete(id) {
    return api.delete(`/contract-templates/${id}`).then(unwrap);
  },

  activate(id) {
    return api.patch(`/contract-templates/${id}/activate`).then(unwrap);
  },

  deactivate(id) {
    return api.patch(`/contract-templates/${id}/deactivate`).then(unwrap);
  },

  /**
   * Plantillas activas por tipo (ADMIN o AGENT).
   * @param {string} contractType SALE | RENT | OPTION_TO_BUY
   */
  listActive(contractType) {
    return api.get('/contract-templates/active', { params: { contractType } }).then(unwrap);
  },
};

export default contractTemplateApi;
