import api from "../api";

const BASE = "/properties";

const postMultipart = (url, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const model3dApi = {
  uploadModel: (propertyId, file) => 
    postMultipart(`${BASE}/${propertyId}/model3d`, file),

  uploadModelGeneric: (file) => 
    postMultipart(`${BASE}/model3d/upload`, file),

  getModels: (propertyId) => api.get(`${BASE}/${propertyId}/model3d`),

  deleteModel: (propertyId, mediaId) => api.delete(`${BASE}/${propertyId}/model3d/${mediaId}`),

  upload360Image: (propertyId, file) => 
    postMultipart(`${BASE}/${propertyId}/tour/360`, file),

  uploadTourConfig: (propertyId, file) => 
    postMultipart(`${BASE}/${propertyId}/tour/config`, file),

  upload360ImageGeneric: (file) => 
    postMultipart(`${BASE}/tour/360/upload`, file),

  uploadTourConfigGeneric: (file) => 
    postMultipart(`${BASE}/tour/config/upload`, file),
};

export default model3dApi;
