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
