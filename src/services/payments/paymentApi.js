import api from '../api';

const paymentApi = {
  createPayment: (paymentData) => api.post('/payments', paymentData),

  getPaymentById: (paymentId) => api.get(`/payments/${paymentId}`),
  
  getMyPayments: (page = 0, size = 10, status = null) => {
    const params = new URLSearchParams({ page, size, sort: 'createdAt,desc' });
    if (status) params.append('status', status);
    return api.get(`/payments/my?${params}`);
  },

  getAllPayments: (page = 0, size = 20, userId = null, status = null) => {
    const params = new URLSearchParams({ page, size, sort: 'createdAt,desc' });
    if (userId) params.append('userId', userId);
    if (status) params.append('status', status);
    return api.get(`/payments?${params}`);
  },

  approvePayment: (paymentId) => api.post(`/payments/${paymentId}/approve`),

  rejectPayment: (paymentId) => api.post(`/payments/${paymentId}/reject`),
};

export default paymentApi;