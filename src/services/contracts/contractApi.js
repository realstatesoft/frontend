import api from '../api';

const contractApi = {
  /** Contratos donde el agente autenticado actúa como agente listador */
  getAsListingAgent() {
    return api.get('/contracts/as-listing-agent').then((res) => (res.data && res.data.data !== undefined) ? res.data.data : res.data);
  },

  /** Contratos donde el agente autenticado actúa como agente del comprador */
  getAsBuyerAgent() {
    return api.get('/contracts/as-buyer-agent').then((res) => (res.data && res.data.data !== undefined) ? res.data.data : res.data);
  },

  /** Contratos donde el usuario autenticado es el vendedor/propietario */
  getAsSeller() {
    return api.get('/contracts/as-seller').then((res) => (res.data && res.data.data !== undefined) ? res.data.data : res.data);
  },

  /** Contratos donde el usuario autenticado es el comprador/inquilino */
  getAsBuyer() {
    return api.get('/contracts/as-buyer').then((res) => (res.data && res.data.data !== undefined) ? res.data.data : res.data);
  },

  /** Obtener un contrato por ID (detalle completo) */
  getById(id) {
    const encodedId = encodeURIComponent(id);
    return api.get(`/contracts/${encodedId}`).then((res) => (res.data && res.data.data !== undefined) ? res.data.data : res.data);
  },

  /** Obtener contratos asociados a una propiedad */
  getByProperty(propertyId) {
    const encodedId = encodeURIComponent(propertyId);
    return api.get(`/contracts/property/${encodedId}`).then((res) => (res.data && res.data.data !== undefined) ? res.data.data : res.data);
  },

  /**
   * Crear un contrato nuevo (queda en DRAFT).
   * @param {Object} payload - ContractRequest
   */
  create(payload) {
    return api.post('/contracts', payload).then((res) => (res.data && res.data.data !== undefined) ? res.data.data : res.data);
  },

  /**
   * Editar un contrato en estado DRAFT.
   * @param {number} id
   * @param {Object} payload - ContractUpdateRequest
   */
  update(id, payload) {
    const encodedId = encodeURIComponent(id);
    return api.put(`/contracts/${encodedId}`, payload).then((res) => (res.data && res.data.data !== undefined) ? res.data.data : res.data);
  },

  /**
   * Actualizar el estado de un contrato.
   * @param {number} id
   * @param {string} status - valor del enum ContractStatus
   */
  updateStatus(id, status) {
    const encodedId = encodeURIComponent(id);
    return api.patch(`/contracts/${encodedId}/status`, { status }).then((res) => (res.data && res.data.data !== undefined) ? res.data.data : res.data);
  },

  /**
   * Firmar digitalmente un contrato.
   * @param {number} id
   * @param {Object} payload - { signatureType, role, signatureData? }
   */
  sign(id, payload) {
    const encodedId = encodeURIComponent(id);
    return api.post(`/contracts/${encodedId}/sign`, payload).then((res) => (res.data && res.data.data !== undefined) ? res.data.data : res.data);
  },

  /**
   * Obtener las firmas registradas de un contrato.
   * @param {number} id
   */
  getSignatures(id) {
    const encodedId = encodeURIComponent(id);
    return api.get(`/contracts/${encodedId}/signatures`).then((res) => (res.data && res.data.data !== undefined) ? res.data.data : res.data);
  },

  /**
   * Activar lease desde un contrato de alquiler firmado.
   * @param {number} id
   */
  activateLease(id) {
    const encodedId = encodeURIComponent(id);
    return api.post(`/contracts/${encodedId}/activate-lease`).then((res) => (res.data && res.data.data !== undefined) ? res.data.data : res.data);
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

