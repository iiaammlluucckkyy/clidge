import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { currentUser, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-navy-900 flex items-center justify-center shadow-glow-cyan animate-pulse">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-navy-900 dark:text-white">CLIDGE</span>
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Preserve ?session= parameter if user followed a faculty QR link
  if (!isAuthenticated) {
    const params = new URLSearchParams(location.search);
    const sessionParam = params.get('session');
    const loginPath = sessionParam ? `/login?session=${encodeURIComponent(sessionParam)}` : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser?.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-navy-800 shadow-card text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-navy-950 dark:text-white">Access Restricted</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {allowedRoles.includes('teacher')
              ? 'This screen is only for Faculty accounts.'
              : 'This screen is designated for Student accounts.'}
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
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-200 font-bold text-xs"
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
