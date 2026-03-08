import {
  PROPERTY_TYPE,
  CATEGORY,
  CONSTRUCTION_STATUS,
  AVAILABILITY,
  VISIBILITY,
  EXTERIOR_FEATURE_IDS,
  INTERIOR_FEATURE_IDS,
  PROPERTY_TYPE_LABELS,
  CATEGORY_LABELS,
  CONSTRUCTION_STATUS_LABELS,
  AVAILABILITY_LABELS,
  VISIBILITY_LABELS,
  ID_TO_EXTERIOR_FEATURE,
  ID_TO_INTERIOR_FEATURE,
} from "../../constants/propertyEnums";
import {
  getInitialBedroom,
  getInitialHalfBathroom,
  getInitialFullBathroom,
  buildRoomsFromCounts,
  DIMENSION_OPTIONS,
} from "../../constants/createPropertyConstants";

// ── Helpers de conversión ─────────────────────────────────────────────────────

const toInt = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
};

const toFloat = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = parseFloat(value);
  return isNaN(n) ? null : n;
};

/** Convierte "700 m²" → 700, "300.5" → 300.5 */
const parseArea = (value) => {
  if (!value) return null;
  const n = parseFloat(String(value).replace(/[^\d.]/g, ""));
  return isNaN(n) ? null : n;
};

/** Convierte "6 x 6 mts." → 36 */
const parseDimensions = (dim) => {
  if (!dim) return null;
  const match = String(dim).match(/(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const area = parseFloat(match[1]) * parseFloat(match[2]);
  return isNaN(area) ? null : area;
};

/** Convierte array de labels a array de IDs del catálogo; omite los no encontrados */
const toFeatureIds = (labels = [], catalog) =>
  labels.map((label) => catalog[label]).filter((id) => id !== undefined);

// ── Mapper principal ──────────────────────────────────────────────────────────

/**
 * Convierte el estado del formulario en el payload que espera
 * el backend en POST /api/properties (CreatePropertyRequest).
 *
 * @param {object} form   - Estado del formulario de CreateProperty
 * @param {object} opts   - { ownerId: number, agentId?: number }
 * @returns {object}      - Payload listo para enviar
 */
export const buildCreatePropertyPayload = (form, { ownerId, agentId } = {}) => {
  const halfBath = toInt(form.halfBathrooms) ?? 0;
  const fullBath = toInt(form.fullBathrooms) ?? 0;

  const rooms = (form.rooms ?? [])
    .filter((r) => r.name?.trim())
    .map((room, index) => ({
      name: room.name.trim() || `Habitación ${index + 1}`,
      area: parseDimensions(room.dimensions),
      interiorFeatureIds: toFeatureIds(room.features, INTERIOR_FEATURE_IDS),
    }));

  const payload = {
    // ── Básico ───────────────────────────────────────────────────────
    title: form.title?.trim() || undefined,
    description: form.description?.trim() || undefined,
    propertyType: PROPERTY_TYPE[form.propertyType],
    category: CATEGORY[form.category],
    address: form.address?.trim() || undefined,

    // ── Ubicación ────────────────────────────────────────────────────
    lat: form.geolocation?.lat ?? null,
    lng: form.geolocation?.lng ?? null,

    // ── Precio ───────────────────────────────────────────────────────
    price: toFloat(form.price),

    // ── Métricas ─────────────────────────────────────────────────────
    surfaceArea: parseArea(form.surfaceArea),
    builtArea: parseArea(form.builtArea),
    parkingSpaces: toInt(form.parkingSpaces),
    floorsCount: toInt(form.floorsCount),

    // ── Habitaciones y baños ─────────────────────────────────────────
    bedrooms: toInt(form.bedrooms),
    halfBathrooms: halfBath,
    fullBathrooms: fullBath,
    bathrooms: halfBath + fullBath,

    // ── Relaciones ───────────────────────────────────────────────────
    ownerId: ownerId ?? undefined,
    agentId: agentId ?? undefined,

    // ── Construcción ─────────────────────────────────────────────────
    constructionYear: toInt(form.year),
    constructionStatus: CONSTRUCTION_STATUS[form.construction_status],
    structureMaterial: form.structureMaterial || undefined,
    wallsMaterial: form.wallsMaterial || undefined,
    floorMaterial: form.floorMaterial || undefined,
    roofMaterial: form.roofMaterial || undefined,

    // ── Servicios ────────────────────────────────────────────────────
    waterConnection: form.waterConnection || undefined,
    sanitaryInstallation: form.sanitaryInstallation || undefined,
    electricityInstallation: form.electricityInstallation || undefined,

    // ── Disponibilidad ───────────────────────────────────────────────
    availability: AVAILABILITY[form.availability],

    // ── Colecciones ──────────────────────────────────────────────────
    rooms: rooms.length > 0 ? rooms : undefined,
    media: form.media?.length > 0 ? normalizeMediaForPayload(form.media) : undefined,
    exteriorFeatureIds: toFeatureIds(form.exteriorFeatures ?? [], EXTERIOR_FEATURE_IDS),
  };

  // Jackson con non_null omite los null, pero limpiamos undefined para claridad
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined)
  );
};

/** Normaliza form.media a PropertyMediaDto: type, url, isPrimary, orderIndex */
function normalizeMediaForPayload(media) {
  const hasPrimary = media.some((m) => m.isPrimary);
  return media.map((m, i) => ({
    type: m.type || "PHOTO",
    url: m.url,
    thumbnailUrl: m.thumbnailUrl ?? undefined,
    isPrimary: hasPrimary ? m.isPrimary : i === 0,
    orderIndex: i,
    title: m.title ?? undefined,
  }));
}

/** Encuentra el string de dimensiones que corresponde a un área numérica */
function findDimensionsByArea(area) {
  if (area == null) return DIMENSION_OPTIONS[2];
  for (const opt of DIMENSION_OPTIONS) {
    if (parseDimensions(opt) === area) return opt;
  }
  return DIMENSION_OPTIONS[2];
}

/**
 * Convierte la respuesta del API (PropertyResponse) al estado del formulario.
 * @param {object} property - Datos de la propiedad del API
 * @returns {object} - Estado del formulario listo para setForm
 */
const mapApiRoomToForm = (room, index, fallbackName) => ({
  name: room.name || fallbackName,
  floor: "Planta baja",
  dimensions: findDimensionsByArea(room.area) || "4 x 4 mts.",
  features: (room.interiorFeatureIds || [])
    .map((id) => ID_TO_INTERIOR_FEATURE[id])
    .filter(Boolean),
});

export const propertyToForm = (property) => {
  if (!property) return null;
  const roomsFromApi = property.rooms || [];
  const b = Math.max(0, property.bedrooms ?? 0);
  const h = Math.max(0, property.halfBathrooms ?? 0);
  const full = Math.max(0, property.fullBathrooms ?? 0);
  const mandatoryCount = b + h + full;
  const rooms =
    roomsFromApi.length > 0
      ? (() => {
          const mapped = roomsFromApi.map((room, i) => {
            const fallback =
              i < b
                ? `Dormitorio ${i + 1}`
                : i < b + h
                  ? `Medio baño ${i - b + 1}`
                  : i < mandatoryCount
                    ? `Baño completo ${i - b - h + 1}`
                    : `Habitación ${i - mandatoryCount + 1}`;
            return mapApiRoomToForm(room, i, fallback);
          });
          const base = buildRoomsFromCounts(b, h, full, []);
          const merged = base.map((defaultRoom, i) =>
            mapped[i] ? { ...defaultRoom, ...mapped[i] } : defaultRoom
          );
          return [...merged, ...mapped.slice(mandatoryCount)];
        })()
      : buildRoomsFromCounts(b, h, full);
  return {
    title: property.title || "",
    category: CATEGORY_LABELS[property.category] ?? "Venta",
    visibility: VISIBILITY_LABELS[property.visibility] ?? "Pública",
    address: property.address || "",
    geolocation: {
      lat: property.lat ?? null,
      lng: property.lng ?? null,
    },
    description: property.description || "",
    propertyType: PROPERTY_TYPE_LABELS[property.propertyType] ?? "Casa",
    price: property.price != null ? String(property.price).replace(/\D/g, "") : "",
    surfaceArea: property.surfaceArea != null ? String(property.surfaceArea) : "",
    builtArea: property.builtArea != null ? String(property.builtArea) : "",
    availability: AVAILABILITY_LABELS[property.availability] ?? "Inmediata",
    electricityInstallation: property.electricityInstallation || "Trifásica",
    waterConnection: property.waterConnection || "Agua corriente",
    sanitaryInstallation: property.sanitaryInstallation || "Red pública",
    exteriorFeatures: (property.exteriorFeatureIds || [])
      .map((id) => ID_TO_EXTERIOR_FEATURE[id])
      .filter(Boolean),
    year: property.constructionYear != null ? String(property.constructionYear) : "",
    construction_status: CONSTRUCTION_STATUS_LABELS[property.constructionStatus] ?? "Usada",
    structureMaterial: property.structureMaterial || "Hormigón",
    wallsMaterial: property.wallsMaterial || "Ladrillo",
    floorMaterial: property.floorMaterial || "Azulejos",
    roofMaterial: property.roofMaterial || "Tejas",
    parkingSpaces: property.parkingSpaces != null ? String(property.parkingSpaces) : "",
    floorsCount: property.floorsCount != null ? String(property.floorsCount) : "",
    bedrooms: property.bedrooms != null ? String(property.bedrooms) : "",
    halfBathrooms: property.halfBathrooms != null ? String(property.halfBathrooms) : "",
    fullBathrooms: property.fullBathrooms != null ? String(property.fullBathrooms) : "",
    rooms,
    media: property.media || [],
  };
};

/**
 * Construye el payload para PUT /api/properties/{id} (UpdatePropertyRequest).
 * Similar a buildCreatePropertyPayload pero sin ownerId y con visibility.
 */
export const buildUpdatePropertyPayload = (form, { agentId } = {}) => {
  const halfBath = toInt(form.halfBathrooms) ?? 0;
  const fullBath = toInt(form.fullBathrooms) ?? 0;

  const rooms = (form.rooms ?? [])
    .filter((r) => r.name?.trim())
    .map((room, index) => ({
      name: room.name.trim() || `Habitación ${index + 1}`,
      area: parseDimensions(room.dimensions),
      interiorFeatureIds: toFeatureIds(room.features, INTERIOR_FEATURE_IDS),
    }));

  const payload = {
    title: form.title?.trim() || undefined,
    description: form.description?.trim() || undefined,
    propertyType: PROPERTY_TYPE[form.propertyType],
    category: CATEGORY[form.category],
    visibility: VISIBILITY[form.visibility],
    address: form.address?.trim() || undefined,
    lat: form.geolocation?.lat ?? null,
    lng: form.geolocation?.lng ?? null,
    price: toFloat(form.price),
    surfaceArea: parseArea(form.surfaceArea),
    builtArea: parseArea(form.builtArea),
    parkingSpaces: toInt(form.parkingSpaces),
    floorsCount: toInt(form.floorsCount),
    bedrooms: toInt(form.bedrooms),
    halfBathrooms: halfBath,
    fullBathrooms: fullBath,
    bathrooms: halfBath + fullBath,
    agentId: agentId ?? undefined,
    constructionYear: toInt(form.year),
    constructionStatus: CONSTRUCTION_STATUS[form.construction_status],
    structureMaterial: form.structureMaterial || undefined,
    wallsMaterial: form.wallsMaterial || undefined,
    floorMaterial: form.floorMaterial || undefined,
    roofMaterial: form.roofMaterial || undefined,
    waterConnection: form.waterConnection || undefined,
    sanitaryInstallation: form.sanitaryInstallation || undefined,
    electricityInstallation: form.electricityInstallation || undefined,
    availability: AVAILABILITY[form.availability],
    rooms: rooms.length > 0 ? rooms : undefined,
    media: form.media?.length > 0 ? normalizeMediaForPayload(form.media) : undefined,
    exteriorFeatureIds: toFeatureIds(form.exteriorFeatures ?? [], EXTERIOR_FEATURE_IDS),
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined)
  );
};
