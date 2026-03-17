/**
 * Utilidades para generar enlaces de WhatsApp.
 * Formato oficial: https://wa.me/PHONENUMBER
 * El número debe estar en formato internacional sin el símbolo + (solo dígitos).
 */

/**
 * Normaliza un número de teléfono para usarlo en la URL de WhatsApp.
 * Elimina espacios, guiones, paréntesis y el prefijo +.
 * Si el número empieza con 0 (ej. 0981...), se asume código de país por defecto.
 *
 * @param {string|null|undefined} phone - Número de teléfono (ej. "+595 981 123 456", "0981123456")
 * @param {string} [defaultCountryCode="595"] - Código de país por defecto si el número empieza con 0
 * @returns {string} - Solo dígitos en formato internacional, ej. "595981123456"
 */
export function normalizePhoneForWhatsApp(phone, defaultCountryCode = "595") {
  if (phone == null || typeof phone !== "string") return "";
  const digits = phone.replace(/\D/g, "");
  if (digits === "") return "";
  // Si empieza con 0, reemplazar por código de país
  if (digits.startsWith("0")) {
    return defaultCountryCode + digits.slice(1);
  }
  return digits;
}

/**
 * Genera el enlace de WhatsApp para contactar a un número.
 *
 * @param {string|null|undefined} phone - Número de teléfono
 * @param {string} [defaultCountryCode="595"] - Código de país por defecto
 * @param {string} [prefilledMessage] - Mensaje prellenado (opcional)
 * @returns {string|null} - URL de wa.me o null si no hay número válido
 */
export function getWhatsAppLink(phone, defaultCountryCode = "595", prefilledMessage) {
  const normalized = normalizePhoneForWhatsApp(phone, defaultCountryCode);
  if (normalized.length < 8) return null;

  const base = `https://wa.me/${normalized}`;
  if (prefilledMessage && prefilledMessage.trim()) {
    const encoded = encodeURIComponent(prefilledMessage.trim());
    return `${base}?text=${encoded}`;
  }
  return base;
}
