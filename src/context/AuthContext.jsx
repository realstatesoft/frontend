import { createContext, useState, useCallback } from "react";
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
import { getUserPreferences } from "../services/preferencesService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getAccessToken());
  const [user, setUser] = useState(() => getUserInfo());
  // null = no verificado aún, true/false = valor real del backend
  const [preferencesCompleted, setPreferencesCompleted] = useState(null);

  /**
   * Carga el estado de onboarding en background tras login/register.
   * @param {number} userId
   */
  const loadPreferencesStatus = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const prefs = await getUserPreferences(userId);
      setPreferencesCompleted(prefs?.onboardingCompleted ?? false);
    } catch (err) {
      // 404 → el usuario no tiene preferencias todavía
      if (err?.response?.status === 404) {
        setPreferencesCompleted(false);
      }
      // Otros errores: dejamos null para no bloquear al usuario
    }
  }, []);

  /**
   * Llamar con el response del login/register.
   * Espera: { accessToken, refreshToken, email, role, id, agentProfileId }
   */
  function login(responseData) {
    const { accessToken, refreshToken, email, role, id, agentProfileId } = responseData ?? {};

    if (!accessToken || typeof accessToken !== "string") {
      throw new Error("login(): accessToken inválido o ausente en el response");
    }
    if (!refreshToken || typeof refreshToken !== "string") {
      throw new Error("login(): refreshToken inválido o ausente en el response");
    }

    // Integramos agentProfileId (de la rama OR-42-Contratos)
    const userInfo = { email, role, userId: id, agentProfileId: agentProfileId ?? null };

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setUserInfo(userInfo);

    setToken(accessToken);
    setUser(userInfo);

    // Cargar estado de preferencias en background (de la rama dev)
    loadPreferencesStatus(id);
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
    setPreferencesCompleted(null);
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

  /**
   * Actualiza el campo preferencesCompleted en el estado global.
   * Llamar tras guardar preferencias exitosamente.
   * @param {boolean} value
   */
  function updatePreferencesCompleted(value) {
    setPreferencesCompleted(value);
  }

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        preferencesCompleted,
        login,
        logout,
        register,
        updatePreferencesCompleted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}