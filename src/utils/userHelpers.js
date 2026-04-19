/**
 * Helpers de estado de usuario.
 * @module userHelpers
 */

/**
 * Devuelve true si el usuario tiene una suspensión activa en este momento.
 * Una suspensión indefinida se representa con una fecha muy lejana (año >= 9000).
 *
 * @param {{ suspendedUntil?: string | null }} user
 * @returns {boolean}
 */
export function isUserSuspended(user) {
  if (!user?.suspendedUntil) return false;
  return new Date(user.suspendedUntil) > new Date();
}

/**
 * Devuelve label y variant de Bootstrap para mostrar el estado del usuario.
 *
 * @param {{ suspendedUntil?: string | null }} user
 * @returns {{ label: string; variant: 'success' | 'danger' }}
 */
export function getUserStatusLabel(user) {
  if (isUserSuspended(user)) {
    const until = user.suspendedUntil
      ? new Date(user.suspendedUntil).getFullYear() >= 9000
        ? 'indefinidamente'
        : `hasta ${new Date(user.suspendedUntil).toLocaleDateString('es-PY')}`
      : '';
    return { label: `Suspendido ${until}`.trim(), variant: 'danger' };
  }
  return { label: 'Activo', variant: 'success' };
}
