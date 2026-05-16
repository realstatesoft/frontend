import api from "../api";

/**
 * Servicio para reseñas de agentes.
 * Base: /agents/:agentId/reviews
 */
const agentReviewsService = {
  /**
   * Obtiene la lista paginada de reseñas de un agente.
   * @param {number|string} agentId
   * @param {Object} params  - page, size, etc.
   */
  getReviews(agentId, params = {}) {
    return api.get(`/agents/${encodeURIComponent(agentId)}/reviews`, { params });
  },

  /**
   * Obtiene el resumen (avgRating, totalReviews) de un agente.
   * @param {number|string} agentId
   */
  getSummary(agentId) {
    return api.get(`/agents/${encodeURIComponent(agentId)}/reviews/summary`);
  },

  /**
   * Obtiene la reseña del usuario autenticado para este agente, o null si no existe.
   * @param {number|string} agentId
   */
  getMyReview(agentId) {
    return api.get(`/agents/${encodeURIComponent(agentId)}/reviews/me`);
  },

  /**
   * Crea una nueva reseña para el agente.
   * @param {number|string} agentId
   * @param {{ rating: number, title: string, comment: string, propertyId?: number }} data
   */
  createReview(agentId, data) {
    return api.post(`/agents/${encodeURIComponent(agentId)}/reviews`, data);
  },

  /**
   * Actualiza una reseña existente del usuario autenticado.
   * @param {number|string} agentId
   * @param {number|string} reviewId
   * @param {{ rating: number, title: string, comment: string, propertyId?: number }} data
   */
  updateReview(agentId, reviewId, data) {
    return api.put(
      `/agents/${encodeURIComponent(agentId)}/reviews/${encodeURIComponent(reviewId)}`,
      data
    );
  },

  /**
   * Elimina la reseña del usuario autenticado para este agente.
   * @param {number|string} agentId
   * @param {number|string} reviewId
   */
  deleteReview(agentId, reviewId) {
    return api.delete(
      `/agents/${encodeURIComponent(agentId)}/reviews/${encodeURIComponent(reviewId)}`
    );
  },
};

export default agentReviewsService;
