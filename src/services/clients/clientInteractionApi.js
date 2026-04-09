import api from "../api";

export async function listClientInteractions(clientId, params = {}) {
  const response = await api.get(`/clients/${clientId}/interactions`, { params });
  return response.data?.data ?? response.data;
}

export async function createClientInteraction(clientId, data) {
  const response = await api.post(`/clients/${clientId}/interactions`, data);
  return response.data?.data ?? response.data;
}

export async function updateClientInteraction(clientId, interactionId, data) {
  const response = await api.put(`/clients/${clientId}/interactions/${interactionId}`, data);
  return response.data?.data ?? response.data;
}

export async function deleteClientInteraction(clientId, interactionId) {
  const response = await api.delete(`/clients/${clientId}/interactions/${interactionId}`);
  return response.data?.data ?? response.data;
}

export default {
  listClientInteractions,
  createClientInteraction,
  updateClientInteraction,
  deleteClientInteraction,
};
