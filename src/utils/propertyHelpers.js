import { ID_TO_EXTERIOR_FEATURE, ID_TO_INTERIOR_FEATURE } from "../constants/propertyEnums";

/**
 * Construye la lista de características para mostrar a partir de los datos de la propiedad.
 * @param {object} property - Datos de la propiedad del API
 * @returns {Array<{ title: string, items: string[] }>}
 */
export function buildFeaturesFromProperty(property) {
  const features = [];
  if (property?.bedrooms != null || property?.bathrooms != null) {
    const items = [];
    if (property.bedrooms != null) items.push(`Dormitorios: ${property.bedrooms}`);
    if (property.bathrooms != null) items.push(`Baños: ${property.bathrooms}`);
    if (property.fullBathrooms != null) items.push(`Baños completos: ${property.fullBathrooms}`);
    if (items.length) features.push({ title: "Dormitorios y baños", items });
  }
  (property?.rooms || []).forEach((room) => {
    const items = [];
    if (room.area != null) items.push(`Superficie: ${room.area} m²`);
    if (room.interiorFeatureIds?.length) {
      const labels = room.interiorFeatureIds
        .map((id) => ID_TO_INTERIOR_FEATURE[id])
        .filter(Boolean);
      if (labels.length) items.push(`Características: ${labels.join(", ")}`);
    }
    if (items.length) features.push({ title: room.name || "Habitación", items });
  });
  if (property?.exteriorFeatureIds?.length) {
    const labels = property.exteriorFeatureIds
      .map((id) => ID_TO_EXTERIOR_FEATURE[id])
      .filter(Boolean);
    if (labels.length) {
      features.push({ title: "Exterior", items: [labels.join(", ")] });
    }
  }
  if (property?.waterConnection || property?.electricityInstallation || property?.sanitaryInstallation) {
    const items = [];
    if (property.waterConnection) items.push(`Agua: ${property.waterConnection}`);
    if (property.electricityInstallation) items.push(`Electricidad: ${property.electricityInstallation}`);
    if (property.sanitaryInstallation) items.push(`Sanitario: ${property.sanitaryInstallation}`);
    if (items.length) features.push({ title: "Servicios", items });
  }
  const constructionItems = [
    property?.structureMaterial && `Estructura: ${property.structureMaterial}`,
    property?.wallsMaterial && `Paredes: ${property.wallsMaterial}`,
    property?.floorMaterial && `Piso: ${property.floorMaterial}`,
    property?.roofMaterial && `Techo: ${property.roofMaterial}`,
  ].filter(Boolean);
  if (constructionItems.length) {
    features.push({ title: "Construcción", items: constructionItems });
  }
  return features;
}
