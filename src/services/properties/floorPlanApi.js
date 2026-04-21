import api from "../api";

const BASE = "/properties";

const postMultipart = (url, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const floorPlanApi = {
  /** Sube un plano directamente a una propiedad ya existente. */
  uploadFloorPlan: (propertyId, file) =>
    postMultipart(`${BASE}/${propertyId}/floor-plans`, file),

  /** Sube un plano sin asociar a propiedad todavía (flujo de creación). */
  uploadFloorPlanGeneric: (file) =>
    postMultipart(`${BASE}/floor-plans/upload`, file),

  /** Lista todos los planos de una propiedad. */
  getFloorPlans: (propertyId) =>
    api.get(`${BASE}/${propertyId}/floor-plans`),

  /** Elimina un plano específico. */
  deleteFloorPlan: (propertyId, mediaId) =>
    api.delete(`${BASE}/${propertyId}/floor-plans/${mediaId}`),
};

export default floorPlanApi;
