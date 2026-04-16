import api from "../api";

/**
 * Busca un usuario registrado por email exacto.
 * Solo disponible para AGENT y ADMIN.
 * @param {string} email - Email del usuario a buscar
 * @returns {Promise<{id: number, name: string, email: string}>}
 */
export async function searchUserByEmail(email) {
  const response = await api.get("/users/search", { params: { email } });
  return response.data?.data ?? response.data;
}

export default { searchUserByEmail };
