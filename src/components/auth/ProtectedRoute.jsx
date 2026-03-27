import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * ProtectedRoute component to restrict access based on authentication and roles.
 * 
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - Component to render if authorized (optional)
 * @param {string} [props.requiredRole] - Optional role required to access the route
 */
const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    // 1. If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. If a specific role is required and user doesn't have it
    if (requiredRole && user?.role !== requiredRole) {
        // Redirect to a neutral page or 404 if they don't have permission
        return <Navigate to="/" replace />;
    }

    // 3. Authorized - return children if provided, otherwise Outlet
    return children ? children : <Outlet />;
};

export default ProtectedRoute;
