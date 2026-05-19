import api from "./api";

const REVIEW_CONFLICT_MESSAGE = "Ya enviaste una reseña para este agente";

function mapReviewApiError(error) {
  if (error?.response?.status === 409) {
    const conflictError = new Error(REVIEW_CONFLICT_MESSAGE);
    conflictError.status = 409;
    conflictError.cause = error;
    return conflictError;
  }
  return error;
}

export async function getReviews(agentId, page = 0, size = 5, options = {}) {
  const encodedAgentId = encodeURIComponent(agentId);
  const response = await api.get(`/agents/${encodedAgentId}/reviews`, {
    params: {
      page,
      size,
      ...(options.sort ? { sort: options.sort } : {}),
      ...(options.rating ? { rating: options.rating } : {}),
    },
  });
  return response.data?.data ?? response.data;
}

export async function getReviewSummary(agentId) {
  const encodedAgentId = encodeURIComponent(agentId);
  const response = await api.get(`/agents/${encodedAgentId}/reviews/summary`);
  return response.data?.data ?? response.data;
}

export async function getMyReview(agentId) {
  const encodedAgentId = encodeURIComponent(agentId);
  try {
    const response = await api.get(`/agents/${encodedAgentId}/reviews/mine`);
    return response.data?.data ?? response.data ?? null;
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createReview(agentId, data) {
  const encodedAgentId = encodeURIComponent(agentId);
  try {
    const response = await api.post(`/agents/${encodedAgentId}/reviews`, data);
    return response.data?.data ?? response.data;
  } catch (error) {
    throw mapReviewApiError(error);
  }
}

export async function updateReview(agentId, reviewId, data) {
  const encodedAgentId = encodeURIComponent(agentId);
  const encodedReviewId = encodeURIComponent(reviewId);
  try {
    const response = await api.patch(
      `/agents/${encodedAgentId}/reviews/${encodedReviewId}`,
      data
    );
    return response.data?.data ?? response.data;
  } catch (error) {
    throw mapReviewApiError(error);
  }
}

export async function deleteReview(agentId, reviewId) {
  const encodedAgentId = encodeURIComponent(agentId);
  const encodedReviewId = encodeURIComponent(reviewId);
  try {
    await api.delete(`/agents/${encodedAgentId}/reviews/${encodedReviewId}`);
    return true;
  } catch (error) {
    throw mapReviewApiError(error);
  }
}

const agentReviewsService = {
  getReviews,
  getReviewSummary,
  getMyReview,
  createReview,
  updateReview,
  deleteReview,
};

export default agentReviewsService;
