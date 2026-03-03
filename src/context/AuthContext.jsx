import { createContext, useState } from "react";
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  getUserInfo,
  setUserInfo,
  clearSession,
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
    const { accessToken, refreshToken, email, role } = responseData ?? {};

    if (!accessToken || typeof accessToken !== "string") {
      throw new Error("login(): accessToken inválido o ausente en el response");
    }
    if (!refreshToken || typeof refreshToken !== "string") {
      throw new Error("login(): refreshToken inválido o ausente en el response");
    }

    const userInfo = { email, role };

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

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


