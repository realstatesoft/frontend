/**
 * Formateo de precios con separador de miles (punto).
 * Reutilizable en inputs, listados y reportes.
 *
 * Formato: 350.000.000 (sin decimales por defecto)
 */

const THOUSANDS_SEP = ".";

/**
 * Convierte un valor crudo (número o string numérico) a string formateado con puntos.
 * @param {string|number|null|undefined} value - Valor del input o estado
 * @returns {string} - Ej: "350.000.000" o ""
 */
export function formatPrice(value) {
  if (value === null || value === undefined) return "";
  const str = String(value).replace(/\D/g, "");
  if (str === "") return "";
  const s = str.replace(/^0+/, "") || "0";
  const parts = [];
  for (let i = s.length; i > 0; i -= 3) {
    parts.unshift(s.slice(Math.max(0, i - 3), i));
  }
  return parts.join(THOUSANDS_SEP);
}

/**
 * Extrae solo dígitos del texto ingresado por el usuario (para guardar valor crudo).
 * @param {string} input - Texto del input (puede incluir puntos, espacios, etc.)
 * @returns {string} - Solo dígitos, ej: "350000000"
 */
export function parsePriceInput(input) {
  if (input == null || input === "") return "";
  return String(input).replace(/\D/g, "");
}
