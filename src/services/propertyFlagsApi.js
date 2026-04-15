import api from './api';

const propertyFlagsApi = {
  createPropertyFlag(propertyId, data) {
    return api.post(`/properties/${propertyId}/flags`, data).then((res) => res.data);
  },

  getActiveFlagCount(propertyId) {
    return api.get(`/properties/${propertyId}/flags/count`).then((res) => res.data);
  },

  getAllActiveFlags() {
    return api.get(`/flags`).then((res) => res.data);
  },

  resolveFlag(flagId, data) {
    return api.put(`/flags/${flagId}/resolve`, data).then((res) => res.data);
  },
};

export default propertyFlagsApi;
