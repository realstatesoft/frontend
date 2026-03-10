import { createContext, useState } from "react";
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  getUserInfo,
  setUserInfo,
  clearSession,
  removeAccessToken,
} from "../utils/authToken";
import api from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getAccessToken());
  const [user, setUser] = useState(() => getUserInfo());

  /**
   * Llamar con el response del login/register.
   * Espera: { accessToken, refreshToken, email, role }
   */
  function login(responseData) {
    const { accessToken, refreshToken, email, role, id } = responseData ?? {};

    if (!accessToken || typeof accessToken !== "string") {
      throw new Error("login(): accessToken inválido o ausente en el response");
    }
    if (!refreshToken || typeof refreshToken !== "string") {
      throw new Error("login(): refreshToken inválido o ausente en el response");
    }

    const userInfo = { email, role, userId: id };

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setUserInfo(userInfo);

    setToken(accessToken);
    setUser(userInfo);
  }

  /**
   * Cierra sesión: invalida el token en el backend y limpia el estado local.
   */
  function logout() {
    // Best-effort: avisar al backend para invalidar el refresh token en DB
    api.post("/auth/logout").catch(() => {});
    clearSession();
    setToken(null);
    setUser(null);
  }

  // --- FUNCIÓN DE REGISTRO ---
  async function register(userData) {
    try {
      const response = await api.post("/auth/register", userData);

      const result = response.data;
      if (result.data && result.data.accessToken) {
        login(result.data);
      }

      return result;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || "Error al registrar el usuario");
      }
      throw error; // Lanzamos el error para que el SignUp.jsx lo atrape y muestre un alert
    }
  }

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}