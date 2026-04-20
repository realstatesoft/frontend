import api from './api';

const rentService = {
  /**
   * Obtiene el desglose del costo inicial de alquiler para una propiedad
   * @param {number|string} propertyId - ID de la propiedad
   * @returns {Promise<{data: {deposit: number, firstMonth: number, commission: number, total: number}}>}
   */
  getRentCost(propertyId) {
    return api.get(`/properties/${propertyId}/rent-cost`).then((res) => res.data);
  },

  /**
   * Obtiene la configuración de alquiler (meses de depósito y porcentaje de comisión)
   * @returns {Promise<{data: {depositMonths: number, commissionPercent: number}}>}
   */
  getRentConfig() {
    return api.get('/config/rent').then((res) => res.data);
  },

  /**
   * Actualiza la configuración de alquiler (solo ADMIN)
   * @param {{depositMonths: number, commissionPercent: number}} payload
   * @returns {Promise<{data: {depositMonths: number, commissionPercent: number}}>}
   */
  updateRentConfig(payload) {
    return api.put('/config/rent', payload).then((res) => res.data);
  },
};

export default rentService;