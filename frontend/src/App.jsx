import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Context
import { AuthProvider } from './context/AuthContext';

// Guards
import RouteGuard from './components/layout/RouteGuard';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Protected Pages (Dashboards)
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import RecruiterDashboardPage from './pages/recruiter/RecruiterDashboardPage';
import TpoDashboardPage from './pages/tpo/TpoDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Routes - Student */}
          <Route
            path="/student/dashboard"
            element={
              <RouteGuard allowedRoles={['student']}>
                <StudentDashboardPage />
              </RouteGuard>
            }
          />

          {/* Protected Routes - Recruiter */}
          <Route
            path="/recruiter/dashboard"
            element={
              <RouteGuard allowedRoles={['recruiter']}>
                <RecruiterDashboardPage />
              </RouteGuard>
            }
          />

          {/* Protected Routes - TPO */}
          <Route
            path="/tpo/dashboard"
            element={
              <RouteGuard allowedRoles={['tpo']}>
                <TpoDashboardPage />
              </RouteGuard>
            }
          />

          {/* Protected Routes - Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <RouteGuard allowedRoles={['admin']}>
                <AdminDashboardPage />
              </RouteGuard>
            }
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
