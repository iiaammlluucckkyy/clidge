import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-navy-900 flex items-center justify-center shadow-glow-cyan animate-pulse">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-navy-900">CLIDGE</span>
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
          </div>
          <p className="text-xs text-slate-500">Verifying session credentials...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, enforce them
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser?.role)) {
    // If student attempts to access teacher page, redirect to student dashboard
    if (currentUser?.role === 'student') {
      return <Navigate to="/student-dashboard" state={{ unauthorizedAttempt: true }} replace />;
    }
    // If teacher attempts to access student-only page, redirect to teacher dashboard
    return <Navigate to="/teacher-dashboard" replace />;
  }

  return children ? children : null;
};

export default ProtectedRoute;
