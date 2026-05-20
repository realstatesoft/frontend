import api from '../api';

const subscriptionApi = {
  // ── Public ──────────────────────────────────────────────────────────────────
  getActivePlans: (params = {}) =>
    api.get('/subscription-plans', { params }),

  getPlanById: (id) =>
    api.get(`/subscription-plans/${id}`),

  // ── Admin ────────────────────────────────────────────────────────────────────
  getAllPlansAdmin: (params = {}) =>
    api.get('/subscription-plans/admin', { params }),

  createPlan: (data) =>
    api.post('/subscription-plans', data),

  updatePlan: (id, data) =>
    api.put(`/subscription-plans/${id}`, data),

  deactivatePlan: (id) =>
    api.post(`/subscription-plans/${id}/deactivate`),

  deletePlan: (id) =>
    api.delete(`/subscription-plans/${id}`),

  // ── User subscriptions ───────────────────────────────────────────────────────
  getMySubscriptions: (params = {}) =>
    api.get('/subscriptions/my', { params }),

  getMyActiveSubscription: () =>
    api.get('/subscriptions/my/active'),

  cancelSubscription: (id) =>
    api.post(`/subscriptions/${id}/cancel`),

  // ── Admin subscriptions ──────────────────────────────────────────────────────
  getAllSubscriptions: (params = {}) =>
    api.get('/subscriptions', { params }),

  getSubscriptionById: (id) =>
    api.get(`/subscriptions/${id}`),
};

export default subscriptionApi;
