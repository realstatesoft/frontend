import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearSession,
} from "../utils/authToken";

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor: adjunta el accessToken ─────────────────────────────
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Control de refresh concurrente ──────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
}

function redirectToLogin(error = null) {
  if (error) processQueue(error, null);
  clearSession();

  const currentPath = window.location.pathname;

  // No agregar redirect si ya estamos en /login o en rutas públicas
  const publicPaths = ["/login", "/register", "/forgot-password"];
  const isPublic = publicPaths.some((p) => currentPath.startsWith(p));

  window.location.href = isPublic ? "/login" : `/login?redirect=${encodeURIComponent(currentPath)}`;
}

// ─── Response interceptor: refresca el token en caso de 401 ──────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Solo actuar en 401 y si no es ya un reintento
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // No interferir con endpoints de autenticación (login, register)
    if (
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      // No hay refresh token → cerrar sesión y redirigir al login preservando la ruta actual
      redirectToLogin();
      return Promise.reject(error);
    }

    // Si ya hay un refresh en curso, encolar la request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // POST /auth/refresh-token con el refreshToken actual
      const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, {
        refreshToken,
      });

      const newAccessToken = data.data.accessToken;
      const newRefreshToken = data.data.refreshToken;

      // Guardar los nuevos tokens
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);

      // Desencolar las requests en espera
      processQueue(null, newAccessToken);

      // Reintentar la request original con el nuevo token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // El refresh falló (refresh token expirado / inválido) → logout forzado
      redirectToLogin(refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;