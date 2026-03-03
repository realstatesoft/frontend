import { createContext, useState } from "react";
import { getAccessToken, setAccessToken, removeAccessToken } from "../utils/authToken";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getAccessToken());

  /**
   * Llamar con el response del login.
   * Ejemplo: login(response.data)
   * Espera que el objeto tenga { accessToken: "..." }
   */
  function login(responseData) {
    const accessToken = responseData?.accessToken;
    if (!accessToken || typeof accessToken !== "string") {
      throw new Error("login(): accessToken inválido o ausente en el response");
    }
    setAccessToken(accessToken);
    setToken(accessToken);
  }

  function logout() {
    removeAccessToken();
    setToken(null);
  }

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


