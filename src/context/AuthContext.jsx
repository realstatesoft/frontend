import { createContext, useState } from "react";
import Cookies from "js-cookie";

const COOKIE_NAME = "accessToken";

const COOKIE_OPTIONS = {
  expires: 1,        // 1 día 
  secure: import.meta.env.PROD, // HTTPS solo en producción, funciona en local también
  sameSite: "Strict",
};

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => Cookies.get(COOKIE_NAME) ?? null);

  /**
   * Llamar con el response del login.
   * Ejemplo: login(response.data)
   * Espera que el objeto tenga { accessToken: "..." }
   */
  function login(responseData) {
    const { accessToken } = responseData;
    Cookies.set(COOKIE_NAME, accessToken, COOKIE_OPTIONS);
    setToken(accessToken);
  }

  function logout() {
    Cookies.remove(COOKIE_NAME);
    setToken(null);
  }

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


