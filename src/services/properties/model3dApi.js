import api from "../api";

const BASE = "/properties";

const model3dApi = {
  uploadModel: (propertyId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`${BASE}/${propertyId}/model3d`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadModelGeneric: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`${BASE}/model3d/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getModels: (propertyId) => api.get(`${BASE}/${propertyId}/model3d`),

  deleteModel: (propertyId, mediaId) => api.delete(`${BASE}/${propertyId}/model3d/${mediaId}`),


  upload360Image: (propertyId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`${BASE}/${propertyId}/tour/360`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadTourConfig: (propertyId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`${BASE}/${propertyId}/tour/config`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  upload360ImageGeneric: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`${BASE}/tour/360/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadTourConfigGeneric: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`${BASE}/tour/config/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default model3dApi;
