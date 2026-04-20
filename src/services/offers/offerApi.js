import api from '../api';

const offerApi = {
  createOffer: (offerData) => api.post('/offers', offerData),
  
  getMyOffers: (page = 0, size = 10) => api.get(`/offers/me/buyer?page=${page}&size=${size}`),
  
  getReceivedOffers: (page = 0, size = 10) => api.get(`/offers/me/received?page=${page}&size=${size}`),
  
  updateOfferStatus: (offerId, statusData) => api.put(`/offers/${offerId}/status`, statusData),

  updateOffer: (offerId, offerData) => api.put(`/offers/${offerId}`, offerData),
  
  getOffersByProperty: (propertyId) => api.get(`/offers/property/${propertyId}`),
};

export default offerApi;
