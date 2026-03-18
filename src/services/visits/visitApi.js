import api from "../api";

// ─── QUERIES ──────────────────────────────────────────────────

/**
 * Obtiene las solicitudes de visita del agente logueado.
 * GET /visit-requests/me/agent
 */
export async function getMyVisitRequestsAsAgent() {
  const response = await api.get("/visit-requests/me/agent");
  return response.data?.data ?? [];
}

/**
 * Obtiene las solicitudes de visita del comprador logueado.
 * GET /visit-requests/me/buyer
 */
export async function getMyVisitRequestsAsBuyer() {
  const response = await api.get("/visit-requests/me/buyer");
  return response.data?.data ?? [];
}

/**
 * Obtiene las solicitudes de visita de una propiedad.
 * GET /visit-requests/property/{propertyId}
 */
export async function getVisitRequestsByProperty(propertyId) {
  const response = await api.get(`/visit-requests/property/${propertyId}`);
  return response.data?.data ?? [];
}

// ─── ACTIONS ──────────────────────────────────────────────────

/**
 * Aceptar una solicitud de visita (AGENT).
 * PUT /visit-requests/{id}/accept
 */
export async function acceptVisitRequest(id) {
  const response = await api.put(`/visit-requests/${id}/accept`);
  return response.data?.data ?? response.data;
}

/**
 * Rechazar una solicitud de visita (AGENT).
 * PUT /visit-requests/{id}/reject
 */
export async function rejectVisitRequest(id) {
  const response = await api.put(`/visit-requests/${id}/reject`);
  return response.data?.data ?? response.data;
}

/**
 * Proponer un nuevo horario (AGENT).
 * PUT /visit-requests/{id}/counter-propose
 * @param {number} id
 * @param {{ counterProposedAt: string, counterProposeMessage?: string }} data
 */
export async function counterProposeVisitRequest(id, data) {
  const response = await api.put(`/visit-requests/${id}/counter-propose`, data);
  return response.data?.data ?? response.data;
}

/**
 * Crear una solicitud de visita (BUYER).
 * POST /visit-requests
 * @param {{ propertyId: number, proposedAt: string, buyerName?: string, buyerEmail?: string, buyerPhone?: string, message?: string }} data
 */
export async function createVisitRequest(data) {
  const response = await api.post("/visit-requests", data);
  return response.data?.data ?? response.data;
}

/**
 * Cancelar una solicitud de visita (BUYER).
 * PUT /visit-requests/{id}/cancel
 */
export async function cancelVisitRequest(id) {
  const response = await api.put(`/visit-requests/${id}/cancel`);
  return response.data?.data ?? response.data;
}

export default {
  getMyVisitRequestsAsAgent,
  getMyVisitRequestsAsBuyer,
  getVisitRequestsByProperty,
  createVisitRequest,
  acceptVisitRequest,
  rejectVisitRequest,
  counterProposeVisitRequest,
  cancelVisitRequest,
};
