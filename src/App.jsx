import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Lazy-loaded route components for high performance and reduced initial bundle chunking
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const EventManagementPage = lazy(() => import('./pages/EventManagementPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Clean fallback loader for seamless route transitions
const RouteLoader = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
    <div className="w-10 h-10 border-3 border-cyan-500/20 border-t-cyan-600 rounded-full animate-spin mb-4"></div>
    <p className="text-xs font-semibold text-slate-600 tracking-wide uppercase">Loading CLIDGE Platform...</p>
  </div>
);

export function App() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* 1. Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 2. Protected Authenticated Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Student Dashboard - Available to Students Only */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Teacher Dashboard - STRICTLY Protected to Teachers Only */}
          <Route
            path="/teacher-dashboard"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />

          {/* Event Management - Available to all authenticated users */}
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <EventManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Profile - Available to all authenticated users */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
