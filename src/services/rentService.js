import api from './api';
import { v4 as uuidv4 } from 'uuid';

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

  // ─── INSTALLMENTS & PAYMENTS ────────────────────────────────────────

  getLeaseInstallments(leaseId) {
    return api.get(`/rentals/installments?leaseId=${encodeURIComponent(leaseId)}`).then((res) => res.data?.data ?? res.data);
  },

  getLeasePayments(leaseId) {
    return api.get(`/rentals/payments?leaseId=${encodeURIComponent(leaseId)}`).then((res) => res.data?.data ?? res.data);
  },

  registerManualPayment(installmentId, payload, idempotencyKey) {
    const key = idempotencyKey || `${installmentId}-${JSON.stringify(payload)}`;
    return api.post(`/rentals/installments/${encodeURIComponent(installmentId)}/payments`, payload, {
      headers: {
        'Idempotency-Key': key,
      },
    }).then((res) => res.data?.data ?? res.data);
  },
};

export default rentService;

