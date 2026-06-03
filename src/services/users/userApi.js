import axios from "axios";
import { getAccessToken } from "../../utils/authToken";
import api from "../api";

const BASE_URL = import.meta.env.VITE_API_URL;

export async function getProfile() {
  const response = await api.get("/users/me");
  return response.data?.data ?? response.data;
}

export async function updateProfile(data) {
  const response = await api.put("/users/me", data);
  return response.data?.data ?? response.data;
}

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

export async function uploadAvatar(file, requestConfig = {}) {
  const formData = new FormData();
  formData.append("file", file);

  const token = getAccessToken();
  const headers = {
    ...(requestConfig.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axios.post(`${BASE_URL}/users/me/avatar`, formData, {
    ...requestConfig,
    withCredentials: true,
    headers,
  });

  return response.data?.data ?? response.data;
}

export default {
  getProfile,
  updateProfile,
  searchUserByEmail,
  uploadAvatar,
};
