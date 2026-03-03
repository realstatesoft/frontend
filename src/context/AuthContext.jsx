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

  // --- FUNCIÓN DE REGISTRO ---
  async function register(userData) {
    try {
      // Hacemos la petición POST al endpoint de Spring Boot
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      // Si el backend responde con un error
      if (!response.ok) {
        throw new Error(result.message || "Error al registrar el usuario");
      }

      // Asumiendo que el backend devuelve un ApiResponse con { data: { accessToken: "..." } }
      // Iniciamos sesión automáticamente usando la función login que ya tienes
      if (result.data && result.data.accessToken) {
        login(result.data);
      }

      return result;
    } catch (error) {
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