// ── Mapeos: label del form (español) → valor del enum del backend ─────────────

export const PROPERTY_TYPE = {
  Casa: "HOUSE",
  Departamento: "APARTMENT",
  Terreno: "LAND",
  Local: "OFFICE",
  Depósito: "WAREHOUSE",
  Campo: "FARM",
};

export const CATEGORY = {
  Venta: "SALE",
  Alquiler: "RENT",
  "Venta o Alquiler": "SALE_OR_RENT",
};

export const CONSTRUCTION_STATUS = {
  Nueva: "NEW",
  Usada: "USED",
  "En construcción": "UNDER_CONSTRUCTION",
  "A refaccionar": "TO_RENOVATE",
};

export const AVAILABILITY = {
  Inmediata: "IMMEDIATE",
  "En 30 días": "IN_30_DAYS",
  "En 60 días": "IN_60_DAYS",
  "A negociar": "TO_NEGOTIATE",
};

// ── Catálogo de features (seed de la BD) → { nombre: id } ────────────────────
// Si el backend expone GET /exterior-features, este mapa puede eliminarse.

export const EXTERIOR_FEATURE_IDS = {
  Piscina: 1,
  Jardín: 2,
  Garage: 3,
  "Parrilla / Quincho": 4,
  "Cerco eléctrico": 5,
  "Cámara de seguridad": 6,
  Terraza: 7,
  "Portón automático": 8,
  "Cancha deportiva": 9,
  "Salón de eventos": 10,
};

export const INTERIOR_FEATURE_IDS = {
  "Aire acondicionado": 1,
  "Piso de porcelanato": 2,
  "Piso de madera": 3,
  "Closet empotrado": 4,
  "Cocina equipada": 5,
  Calefón: 6,
  "Ventilador de techo": 7,
  "Mesada de granito": 8,
};

// ── Mapeos inversos: valor del backend → label para mostrar ─────────────────
export const PROPERTY_TYPE_LABELS = Object.fromEntries(
  Object.entries(PROPERTY_TYPE).map(([k, v]) => [v, k])
);
export const CATEGORY_LABELS = Object.fromEntries(
  Object.entries(CATEGORY).map(([k, v]) => [v, k])
);
export const CONSTRUCTION_STATUS_LABELS = Object.fromEntries(
  Object.entries(CONSTRUCTION_STATUS).map(([k, v]) => [v, k])
);
export const ID_TO_EXTERIOR_FEATURE = Object.fromEntries(
  Object.entries(EXTERIOR_FEATURE_IDS).map(([k, v]) => [v, k])
);
export const ID_TO_INTERIOR_FEATURE = Object.fromEntries(
  Object.entries(INTERIOR_FEATURE_IDS).map(([k, v]) => [v, k])
);

// ── Listas de opciones para los selects/multiselects del form ─────────────────

export const PROPERTY_TYPE_OPTIONS = Object.keys(PROPERTY_TYPE);
export const CATEGORY_OPTIONS = Object.keys(CATEGORY);
export const CONSTRUCTION_STATUS_OPTIONS = Object.keys(CONSTRUCTION_STATUS);
export const AVAILABILITY_OPTIONS = Object.keys(AVAILABILITY);
export const EXTERIOR_FEATURE_OPTIONS = Object.keys(EXTERIOR_FEATURE_IDS);
export const INTERIOR_FEATURE_OPTIONS = Object.keys(INTERIOR_FEATURE_IDS);

// ── Opciones para ShowProperty (estado y visibilidad) ────────────────────────
export const PROPERTY_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendiente" },
  { value: "APPROVED", label: "Aprobado" },
  { value: "REJECTED", label: "Rechazado" },
  { value: "PUBLISHED", label: "Publicado" },
  { value: "SOLD", label: "Vendido" },
  { value: "RENTED", label: "Alquilado" },
  { value: "ARCHIVED", label: "Archivado" },
];

export const PROPERTY_VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "Público" },
  { value: "PRIVATE", label: "Privado" },
  { value: "HIDDEN", label: "Oculto" },
];
