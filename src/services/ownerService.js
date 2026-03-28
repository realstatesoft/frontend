import api from './api';

const ownerService = {
  getStats() {
    return api.get('/dashboard/owner/stats').then((res) => res.data);
  },

  getMyProperties(params = {}) {
    return api.get('/properties/me', { params }).then((res) => {
      // Backend returns ApiResponse<Page<...>>, extract content array
      const page = res.data?.data;
      if (page && page.content) {
        return { ...res.data, data: page.content };
      }
      return res.data;
    });
  },

  getVisitRequests() {
    return api.get('/visit-requests/me/buyer').then((res) => {
      // Map backend VisitRequestResponse to the shape expected by OwnerVisitsPage
      const visits = res.data?.data;
      if (Array.isArray(visits)) {
        return {
          ...res.data,
          data: visits.map((v) => ({
            id: v.id,
            propertyTitle: v.propertyTitle,
            visitorName: v.buyerName || v.agentName || 'N/A',
            visitorEmail: v.buyerEmail || '',
            date: v.proposedAt,
            status: v.status?.toLowerCase() || 'pendiente',
            message: v.message || '',
          })),
        };
      }
      return res.data;
    });
  },

  getMessages() {
    return api.get('/messages/conversations').then((res) => res.data);
  },
};

export default ownerService;
