/**
 * Shared form utilities for client registration and editing.
 * Centralizes enum maps, payload transformations, and form hydration.
 */

// ── Empty form shape (shared default) ────────────────────────────────────────
export const EMPTY_FORM = {
  // Personal
  firstName: "",
  lastName: "",
  birthDate: "",
  maritalStatus: "",
  occupation: "",
  email: "",
  phone: "",
  address: "",
  annualIncome: "",
  // Internal
  priority: "Alta",
  status: "Activo",
  originChannel: "",
  comments: "",
  tags: [],
  isSearchingProperty: false,
  // Search preferences
  budgetRange: "",
  bedrooms: "",
  bathrooms: "",
  propertyTypes: [],
  preferredZones: [],
  preferredCharacteristics: [],
};

// ── Enum translations (backend → form label) ────────────────────────────────
export const MARITAL_STATUS_MAP = {
  SINGLE: "Soltero/a",
  MARRIED: "Casado/a",
  DIVORCED: "Divorciado/a",
  WIDOWED: "Viudo/a",
};

export const PRIORITY_MAP = {
  HIGH: "Alta",
  MEDIUM: "Media",
  LOW: "Baja",
};

export const STATUS_MAP = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  ARCHIVED: "Archivado",
};

// ── Reverse enum maps (form label → Java enum value) ─────────────────────────
export const PRIORITY_TO_ENUM = { Alta: "HIGH", Media: "MEDIUM", Baja: "LOW" };
export const STATUS_TO_ENUM = {
  Activo: "ACTIVE",
  Inactivo: "INACTIVE",
  Archivado: "ARCHIVED",
  "En seguimiento": "INACTIVE",
};
export const MARITAL_TO_ENUM = {
  "Soltero/a": "SINGLE",
  "Casado/a": "MARRIED",
  "Divorciado/a": "DIVORCED",
  "Viudo/a": "WIDOWED",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Remove locale-style thousands separators (e.g. "1.200.000" → "1200000"). */
export function normalizeNumberString(str) {
  if (!str) return "";
  const normalize = (s) => s.replace(/\.(\d{3})(?=[^\d]|$)/g, "$1");
  return normalize(String(str).replace(/[^\d.]/g, ""));
}

/** Parse a "min - max" range string into { min, max } numbers. */
export function parseRange(str) {
  if (!str || !String(str).trim()) return { min: null, max: null };
  const parts = String(str)
    .split("-")
    .map((p) => parseFloat(normalizeNumberString(p)));
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { min: parts[0], max: parts[1] };
  }
  const single = parts[0];
  return isNaN(single) ? { min: null, max: null } : { min: single, max: single };
}

// ── clientToForm: API object → form state ────────────────────────────────────

/** Map the API client object to the form shape used by the section components. */
export function clientToForm(client) {
  if (!client) return EMPTY_FORM;

  // Split "Juan Pérez" into firstName / lastName (first word vs rest)
  const fullName = client.userName ?? client.name ?? "";
  const spaceIdx = fullName.indexOf(" ");
  const firstName = spaceIdx >= 0 ? fullName.slice(0, spaceIdx) : fullName;
  const lastName = spaceIdx >= 0 ? fullName.slice(spaceIdx + 1) : "";

  // Budget: build a readable range string from minBudget / maxBudget
  const budgetRange =
    client.minBudget != null && client.maxBudget != null
      ? `${Number(client.minBudget).toLocaleString("es")} US$ - ${Number(client.maxBudget).toLocaleString("es")} US$`
      : client.budgetRange ?? "";

  // Bedrooms / bathrooms: "min - max" string, or single value
  const bedrooms =
    client.minBedrooms != null && client.maxBedrooms != null
      ? `${client.minBedrooms} - ${client.maxBedrooms}`
      : String(client.bedrooms ?? "");

  const bathrooms =
    client.minBathrooms != null && client.maxBathrooms != null
      ? `${client.minBathrooms} - ${client.maxBathrooms}`
      : String(client.bathrooms ?? "");

  return {
    firstName,
    lastName,
    birthDate: client.birthDate ?? "",
    maritalStatus: MARITAL_STATUS_MAP[client.maritalStatus] ?? client.maritalStatus ?? "",
    occupation: client.occupation ?? "",
    email: client.userEmail ?? client.email ?? "",
    phone: client.phone ?? client.userPhone ?? "",
    address: client.address ?? "",
    annualIncome: client.annualIncome != null ? String(client.annualIncome) : "",
    priority: PRIORITY_MAP[client.priority] ?? client.priority ?? "Alta",
    status: STATUS_MAP[client.status] ?? client.status ?? "Activo",
    originChannel: client.sourceChannel ?? client.originChannel ?? client.origin_channel ?? "",
    comments: client.notes ?? client.comments ?? "",
    tags: client.tags ?? [],
    isSearchingProperty: client.isSearchingProperty ?? client.is_searching_property ?? false,
    budgetRange,
    bedrooms,
    bathrooms,
    propertyTypes: client.preferredPropertyTypes ?? client.propertyTypes ?? [],
    preferredZones: client.preferredAreas ?? client.preferredZones ?? [],
    preferredCharacteristics: client.desiredFeatures ?? client.preferredCharacteristics ?? [],
  };
}

// ── formToPayload: form state → API JSON body ────────────────────────────────

/** Transform the form state to the JSON payload expected by the backend. */
export function formToPayload(form) {
  const budgetParts = parseRange(form.budgetRange);
  const bedroomParts = parseRange(form.bedrooms);
  const bathroomParts = parseRange(form.bathrooms);
  const annualIncome = form.annualIncome
    ? parseFloat(normalizeNumberString(form.annualIncome))
    : null;

  return {
    firstName: form.firstName || null,
    lastName: form.lastName || null,
    userPhone: form.phone || null,
    userEmail: form.email || null,
    status: STATUS_TO_ENUM[form.status] ?? form.status ?? null,
    priority: PRIORITY_TO_ENUM[form.priority] ?? form.priority ?? null,
    tags: form.tags ?? [],

    minBudget: budgetParts.min,
    maxBudget: budgetParts.max,

    minBedrooms: bedroomParts.min != null ? Math.round(bedroomParts.min) : null,
    maxBedrooms: bedroomParts.max != null ? Math.round(bedroomParts.max) : null,

    minBathrooms: bathroomParts.min != null ? Math.round(bathroomParts.min) : null,
    maxBathrooms: bathroomParts.max != null ? Math.round(bathroomParts.max) : null,

    birthDate: form.birthDate || null,
    maritalStatus: MARITAL_TO_ENUM[form.maritalStatus] || null,
    occupation: form.occupation || null,
    annualIncome: isNaN(annualIncome) ? null : annualIncome,
    address: form.address || null,
    sourceChannel: form.originChannel || null,

    preferredPropertyTypes: form.propertyTypes ?? [],
    preferredAreas: form.preferredZones ?? [],
    desiredFeatures: form.preferredCharacteristics ?? [],

    notes: form.comments || null,
    isSearchingProperty: form.isSearchingProperty ?? false,
  };
}
