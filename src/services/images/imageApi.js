import axios from "axios";
import { getAccessToken } from "../../utils/authToken";

const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Sube una imagen al storage.
 * @param {File} file - Archivo de imagen (jpg, png, webp — máx 5 MB)
 * @param {string} folder - Carpeta en el bucket (default "general")
 * @returns {Promise<{ data: { success, data: { id, url, filename, size, contentType } } }>}
 */
export function uploadImage(file, folder = "general", requestConfig = {}) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const token = getAccessToken();

  const headers = {
    ...(requestConfig.headers || {}),
    "Authorization": `Bearer ${token}`,
    // NO incluir Content-Type aquí para que el navegador lo genere con el boundary correcto
  };

  // Usamos axios directamente para evitar que los interceptores de 'api'
  // (que pueden tener Content-Type: application/json) interfieran con FormData.
  return axios.post(`${BASE_URL}/images/upload`, formData, {
    ...requestConfig,
    headers,
  });
}
