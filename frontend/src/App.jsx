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

// Protected Pages - Student Module
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentResumePage from './pages/student/StudentResumePage';
import StudentRoadmapPage from './pages/student/StudentRoadmapPage';
import StudentInterviewPage from './pages/student/StudentInterviewPage';
import StudentJobsPage from './pages/student/StudentJobsPage';
import StudentApplicationsPage from './pages/student/StudentApplicationsPage';
import StudentBookmarksPage from './pages/student/StudentBookmarksPage';
import StudentNotificationsPage from './pages/student/StudentNotificationsPage';
import StudentSettingsPage from './pages/student/StudentSettingsPage';

// Protected Pages - Other Modules
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

          {/* Protected Routes - Student Module */}
          <Route
            path="/student/profile"
            element={
              <RouteGuard allowedRoles={['student']} requireCompleteProfile={false}>
                <StudentProfilePage />
              </RouteGuard>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <RouteGuard allowedRoles={['student']}>
                <StudentDashboardPage />
              </RouteGuard>
            }
          />
          <Route
            path="/student/resume"
            element={
              <RouteGuard allowedRoles={['student']}>
                <StudentResumePage />
              </RouteGuard>
            }
          />
          <Route
            path="/student/roadmap"
            element={
              <RouteGuard allowedRoles={['student']}>
                <StudentRoadmapPage />
              </RouteGuard>
            }
          />
          <Route
            path="/student/interview"
            element={
              <RouteGuard allowedRoles={['student']}>
                <StudentInterviewPage />
              </RouteGuard>
            }
          />
          <Route
            path="/student/jobs"
            element={
              <RouteGuard allowedRoles={['student']}>
                <StudentJobsPage />
              </RouteGuard>
            }
          />
          <Route
            path="/student/applications"
            element={
              <RouteGuard allowedRoles={['student']}>
                <StudentApplicationsPage />
              </RouteGuard>
            }
          />
          <Route
            path="/student/bookmarks"
            element={
              <RouteGuard allowedRoles={['student']}>
                <StudentBookmarksPage />
              </RouteGuard>
            }
          />
          <Route
            path="/student/notifications"
            element={
              <RouteGuard allowedRoles={['student']}>
                <StudentNotificationsPage />
              </RouteGuard>
            }
          />
          <Route
            path="/student/settings"
            element={
              <RouteGuard allowedRoles={['student']}>
                <StudentSettingsPage />
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
