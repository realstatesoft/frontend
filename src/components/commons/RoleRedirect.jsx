import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function RoleRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'AGENT') {
    return <Navigate to="/agent/dashboard" replace />;
  }

  return <Navigate to="/owner/dashboard" replace />;
}
