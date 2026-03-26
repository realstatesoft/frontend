import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Componente envoltorio que protege rutas que requieren autenticación.
 * Si el usuario no está logueado, redirige a /login conservando la ubicación
 * original en el state (from) para poder volver después del login.
 */
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const fullUrl = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" state={{ from: fullUrl }} replace />;
  }

  return <Outlet />;
}
