import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Hook para usar el contexto de autenticación.
 * Uso: const { token, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return context;
}
