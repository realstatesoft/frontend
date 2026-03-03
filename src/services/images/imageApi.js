import api from "../api";

/**
 * Sube una imagen al storage.
 * @param {File} file - Archivo de imagen (jpg, png, webp — máx 5 MB)
 * @param {string} folder - Carpeta en el bucket (default "general")
 * @param {object} [requestConfig] - Config adicional para axios (ej. headers)
 * @returns {Promise<{ data: { success, data: { id, url, filename, size, contentType } } }>}
 */
export function uploadImage(file, folder = "general", requestConfig = {}) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  return api.post("/images/upload", formData, requestConfig);
}
