import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function RouteGuard({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center space-y-4">
        {/* Sleek rotating loader */}
        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
        <span className="font-mono text-xs text-secondary tracking-widest uppercase animate-pulse">
          Securing Environment...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save current path to redirect back after successful login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Role claim check failed - redirect to landing or correct dashboard
    console.warn(`Access Denied. Role '${user?.role}' is not in allowed roles:`, allowedRoles);
    return <Navigate to="/" replace />;
  }

  return children;
}
