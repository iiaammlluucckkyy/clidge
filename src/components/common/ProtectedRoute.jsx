import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { currentUser, isAuthenticated, isLoading, logout } = useAuth();
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

  // If specific roles are required, enforce them with clear institutional card
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser?.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card text-center space-y-4 animate-in fade-in-50">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-navy-950">Access Restricted</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {allowedRoles.includes('teacher')
              ? 'This section requires verified Faculty Coordinator privileges. Your account is currently logged in with student permissions.'
              : 'This section is designated for registered students only.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={currentUser?.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-colors inline-block"
            >
              Go to My Dashboard
            </a>
            <button
              type="button"
              onClick={async () => {
                if (logout) await logout();
                window.location.href = '/login';
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
            >
              Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children ? children : null;
};

export default ProtectedRoute;
