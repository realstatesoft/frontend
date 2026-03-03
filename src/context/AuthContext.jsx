import { createContext, useState } from "react";
import { getAccessToken, setAccessToken, removeAccessToken } from "../utils/authToken";
import api from "../services/api";

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

  // --- FUNCIÓN DE REGISTRO ---
  async function register(userData) {
    try {
      // Hacemos la petición POST al endpoint de Spring Boot
      const response = await api.post("/api/auth/register", userData);

      const result = response.data;

      // Asumiendo que el backend devuelve un ApiResponse con { data: { accessToken: "..." } }
      // Iniciamos sesión automáticamente usando la función login que ya tienes
      if (result.data && result.data.accessToken) {
        login(result.data);
      }

      return result;
    } catch (error) {
      // Si axios recibió una respuesta con error, extraemos el mensaje del backend
      if (error.response) {
        throw new Error(error.response.data?.message || "Error al registrar el usuario");
      }
      throw error; // Lanzamos el error para que el SignUp.jsx lo atrape y muestre un alert
    }
  }

  function logout() {
    removeAccessToken();
    setToken(null);
  }

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}