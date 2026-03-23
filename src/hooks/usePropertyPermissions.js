import { useAuth } from "./useAuth";

/**
 * Hook que deriva los permisos de acción sobre una propiedad
 * a partir del rol y la identidad del usuario autenticado.
 *
 * @param {object|null} property  La propiedad actual (puede ser null mientras carga).
 * @returns {{
 *   canChangeStatus: boolean,
 *   canChangeVisibility: boolean,
 *   canEdit: boolean,
 *   canDelete: boolean,
 *   canFeature: boolean,
 *   canShare: boolean,
 *   isOwner: boolean,
 *   isAdmin: boolean,
 * }}
 */
export function usePropertyPermissions(property, propertyAssignments = null) {
  const { user, isAuthenticated } = useAuth();

  // Si el token expiró o el usuario no está cargado, tratar como visitante.
  if (!isAuthenticated || !user) {
    return {
      canChangeStatus: false,
      canChangeVisibility: false,
      canEdit: false,
      canDelete: false,
      canFeature: false,
      canShare: true,
      isOwner: false,
      isAdmin: false,
    };
  }

  const isAdmin = user.role?.toUpperCase() === "ADMIN";

  // Soportar tanto ownerId como userId según lo que envíe el backend.
  const propertyOwnerId = property?.ownerId ?? property?.userId ?? null;
  const isOwner = propertyOwnerId !== null && propertyOwnerId === user.userId;

  // Usa las asignaciones que se pasen por parámetro o que vengan en el objeto property
  const assignments = propertyAssignments || property?.propertyAssignments || [];
  const hasAssignment = assignments.some(
    a => a.userId === user.userId && a.propertyId === property?.id
  );

  const canAct = isOwner || isAdmin || hasAssignment;

  return {
    /** Solo ADMIN puede cambiar el estado de revisión (Pendiente/Aprobado/etc.). */
    canChangeStatus: isAdmin,

    /** El propietario, ADMIN o asignado pueden cambiar la visibilidad (Público/Privado/Oculto). */
    canChangeVisibility: canAct,

    /** El propietario, ADMIN o asignado pueden editar la propiedad. */
    canEdit: canAct,

    /** El propietario o ADMIN pueden eliminar la propiedad (NO los asignados). */
    canDelete: isOwner || isAdmin,

    /** Cualquier usuario autenticado puede destacar. */
    canFeature: !!user,

    /** Compartir está disponible para todos, incluso visitantes. */
    canShare: true,

    isOwner,
    isAdmin,
  };
}
