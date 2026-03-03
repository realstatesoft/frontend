import {
  PROPERTY_TYPE,
  CATEGORY,
  CONSTRUCTION_STATUS,
  AVAILABILITY,
  EXTERIOR_FEATURE_IDS,
  INTERIOR_FEATURE_IDS,
} from "../../constants/propertyEnums";

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
    media: form.media?.length > 0 ? form.media : undefined,
    exteriorFeatureIds: toFeatureIds(form.exteriorFeatures ?? [], EXTERIOR_FEATURE_IDS),
  };

  // Jackson con non_null omite los null, pero limpiamos undefined para claridad
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined)
  );
};
