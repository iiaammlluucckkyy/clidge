import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import EventManagementPage from './pages/EventManagementPage';
import ProfilePage from './pages/ProfilePage';

export function App() {
  return (
    <Routes>
      {/* 1. Landing Page (Full Hero and Login Entry) */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. Dashboard & Portal Shell with Sidebar, Header & Mobile Nav */}
      <Route element={<AppLayout />}>
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/events" element={<EventManagementPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
