import api from "../api";

const BASE = "/users/me/documents";

/**
 * Obtiene todos los documentos personales del usuario autenticado.
 * @returns {Promise<Array>} Lista de documentos
 */
export async function getMyDocuments() {
  const { data: res } = await api.get(BASE);
  return res.data;
}

/**
 * Sube un nuevo documento personal.
 * @param {File} file - Archivo a subir (PDF, JPG, PNG, WebP — máx. 10 MB)
 * @param {string} documentType - Tipo de documento (ID, PROOF_OF_INCOME, etc.)
 * @returns {Promise<Object>} Documento creado
 */
export async function uploadDocument(file, documentType) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentType", documentType);

  const { data: res } = await api.post(BASE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/**
 * Reemplaza el archivo de un documento existente.
 * @param {number} id - ID del documento a reemplazar
 * @param {File} file - Nuevo archivo
 * @returns {Promise<Object>} Documento actualizado
 */
export async function replaceDocument(id, file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data: res } = await api.put(`${BASE}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/**
 * Elimina (soft delete) un documento personal.
 * @param {number} id - ID del documento a eliminar
 */
export async function deleteDocument(id) {
  await api.delete(`${BASE}/${id}`);
}
