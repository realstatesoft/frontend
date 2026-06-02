import api from "./api";

export async function getMyAgents(params = {}) {
  const response = await api.get("/agent-clients/my-agents", { params });
  return response.data?.data ?? response.data;
}

export default {
  getMyAgents,
};
