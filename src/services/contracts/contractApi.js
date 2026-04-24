import api from '../api';

const contractApi = {
  /** Contratos donde el agente autenticado actúa como agente listador */
  getAsListingAgent() {
    return api.get('/contracts/as-listing-agent').then((res) => res.data);
  },

  /** Contratos donde el agente autenticado actúa como agente del comprador */
  getAsBuyerAgent() {
    return api.get('/contracts/as-buyer-agent').then((res) => res.data);
  },

  /** Contratos donde el usuario autenticado es el vendedor/propietario */
  getAsSeller() {
    return api.get('/contracts/as-seller').then((res) => res.data);
  },

  /** Contratos donde el usuario autenticado es el comprador/inquilino */
  getAsBuyer() {
    return api.get('/contracts/as-buyer').then((res) => res.data);
  },

  /** Obtener un contrato por ID (detalle completo) */
  getById(id) {
    return api.get(`/contracts/${id}`).then((res) => res.data);
  },

  /** Obtener contratos asociados a una propiedad */
  getByProperty(propertyId) {
    return api.get(`/contracts/property/${propertyId}`).then((res) => res.data);
  },

  /**
   * Crear un contrato nuevo (queda en DRAFT).
   * @param {Object} payload - ContractRequest
   */
  create(payload) {
    return api.post('/contracts', payload).then((res) => res.data);
  },

  /**
   * Editar un contrato en estado DRAFT.
   * @param {number} id
   * @param {Object} payload - ContractUpdateRequest
   */
  update(id, payload) {
    return api.put(`/contracts/${id}`, payload).then((res) => res.data);
  },

  /**
   * Actualizar el estado de un contrato.
   * @param {number} id
   * @param {string} status - valor del enum ContractStatus
   */
  updateStatus(id, status) {
    return api.patch(`/contracts/${id}/status`, { status }).then((res) => res.data);
  },

  /**
   * Firmar digitalmente un contrato.
   * @param {number} id
   * @param {Object} payload - { signatureType, role, signatureData? }
   */
  sign(id, payload) {
    return api.post(`/contracts/${id}/sign`, payload).then((res) => res.data);
  },

  /**
   * Obtener las firmas registradas de un contrato.
   * @param {number} id
   */
  getSignatures(id) {
    return api.get(`/contracts/${id}/signatures`).then((res) => res.data);
  },

  /**
   * Descargar el contrato como PDF.
   * Retorna un objeto { url, filename } para disparar la descarga.
   * @param {number} id
   * @param {string} [filename] - nombre sugerido para el archivo
   */
  async downloadPdf(id, filename) {
    const response = await api.get(`/contracts/${id}/pdf`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url  = URL.createObjectURL(blob);
    return { url, filename: filename ?? `contrato-${id}.pdf` };
  },
};

export default contractApi;

