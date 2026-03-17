/**
 * Colores del badge de estado según el status del backend.
 * Las keys son los labels en español que se muestran en la UI.
 */
export const tagColors = {
    Publicado: "#2e7d32",
    Disponible: "#2e7d32",
    Vendido: "#7b1fa2",
    Alquilado: "#b39ddb",
    Pendiente: "#757575",
    Aprobado: "#1565c0",
    Rechazado: "#c62828",
    Archivado: "#455a64",
};

/**
 * Mapeo de status del backend → label en español para la UI.
 */
export const STATUS_LABELS = {
    PENDING: "Pendiente",
    APPROVED: "Aprobado",
    REJECTED: "Rechazado",
    PUBLISHED: "Publicado",
    SOLD: "Vendido",
    RENTED: "Alquilado",
    ARCHIVED: "Archivado",
};

/** Para "Mis Propiedades": mostrar "Disponible" en vez de "Publicado" */
export const STATUS_DISPLAY_LABELS = {
    ...STATUS_LABELS,
    PUBLISHED: "Disponible",
};

/** Labels para badges en cards de favoritos (ej. "Vendida" en vez de "Vendido") */
export const FAVORITE_STATUS_LABELS = {
    ...STATUS_DISPLAY_LABELS,
    SOLD: "Vendida",
};

/**
 * Estilos de badges para cards de favoritos.
 * Fondo pastel claro + texto oscuro (estilo pill).
 */
export const FAVORITE_BADGE_STYLES = {
    Disponible: { bg: "#e8f5e9", text: "#2e7d32" },
    Vendido: { bg: "#ffebee", text: "#c62828" },
    Vendida: { bg: "#ffebee", text: "#c62828" },
    Alquilado: { bg: "#f3e5f5", text: "#7b1fa2" },
    Pendiente: { bg: "#eceff1", text: "#455a64" },
    Aprobado: { bg: "#e3f2fd", text: "#1565c0" },
    Rechazado: { bg: "#ffebee", text: "#c62828" },
    Archivado: { bg: "#eceff1", text: "#455a64" },
    Publicado: { bg: "#e8f5e9", text: "#2e7d32" },
};
