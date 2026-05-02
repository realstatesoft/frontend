/**
 * Image optimization utility for OpenRoof.
 * Generates URLs with transformation query parameters so the backend/CDN
 * can serve images at the exact size needed by each UI context.
 */

import PLACEHOLDER_IMAGE from '../assets/placeholder_img.png';

/**
 * Genera una URL de imagen optimizada con parámetros de transformación.
 * @param {string} url - URL original de la imagen
 * @param {object} opts - Opciones de transformación
 * @param {number} opts.width - Ancho deseado en px
 * @param {number} opts.height - Alto deseado en px (opcional)
 * @param {string} opts.format - Formato de salida (default: 'webp')
 * @param {number} opts.quality - Calidad 1-100 (default: 80)
 * @returns {string} URL con parámetros de transformación
 */
export function getOptimizedImageUrl(url, { width, height, format = 'webp', quality = 80 } = {}) {
  if (!url) return PLACEHOLDER_IMAGE;

  try {
    const parsed = new URL(url, window.location.origin);
    if (width)   parsed.searchParams.set('w', String(width));
    if (height)  parsed.searchParams.set('h', String(height));
    if (format)  parsed.searchParams.set('format', format);
    if (quality) parsed.searchParams.set('q', String(quality));
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Presets de tamaño para contextos comunes del UI.
 */
export const IMAGE_PRESETS = {
  cardThumb:   { width: 400, height: 260, quality: 75 },
  summaryCard: { width: 240, height: 160, quality: 70 },
  heroMain:    { width: 800, height: 500, quality: 85 },
  heroThumb:   { width: 400, height: 250, quality: 75 },
  mapPopup:    { width: 260, height: 160, quality: 70 },
  avatar:      { width: 80,  height: 80,  quality: 75 },
};
