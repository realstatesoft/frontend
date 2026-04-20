import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function RoleRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role?.toUpperCase();

  if (role === 'AGENT') {
    return <Navigate to="/agent/dashboard" replace />;
  }

  if (role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (role === 'USER') {
    return <Navigate to="/owner/dashboard" replace />;
  }

  // Fallback to home page for unrecognized roles
  return <Navigate to="/" replace />;
}
