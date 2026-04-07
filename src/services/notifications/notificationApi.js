import api from "../api";

const BASE = "/notifications";

const notificationApi = {
  getAll: (params) => api.get(`${BASE}/me`, { params }),

  getUnreadCount: () => api.get(`${BASE}/me/unread-count`),

  markAsRead: (id) => api.put(`${BASE}/${id}/read`),

  markAllAsRead: () => api.put(`${BASE}/me/read-all`),

  deleteNotification: (id) => api.delete(`${BASE}/${id}`),

  deleteAllNotifications: (params) => api.delete(`${BASE}/me`, { params }),
};

export default notificationApi;
