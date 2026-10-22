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
import AwaitingApprovalPage from './pages/AwaitingApprovalPage';

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
import RecruiterJobsPage from './pages/recruiter/RecruiterJobsPage';
import RecruiterApplicantsPage from './pages/recruiter/RecruiterApplicantsPage';
import RecruiterProfilePage from './pages/recruiter/RecruiterProfilePage';
import TpoDashboardPage from './pages/tpo/TpoDashboardPage';
import TpoApprovalsPage from './pages/tpo/TpoApprovalsPage';
import TpoStudentsPage from './pages/tpo/TpoStudentsPage';
import TpoRecruitmentPage from './pages/tpo/TpoRecruitmentPage';
import TpoAnalyticsPage from './pages/tpo/TpoAnalyticsPage';
import TpoAuditPage from './pages/tpo/TpoAuditPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UsersListPage from './pages/admin/UsersListPage';
import UserDetailPage from './pages/admin/UserDetailPage';
import RolesPage from './pages/admin/RolesPage';
import PlacementMonitoringPage from './pages/admin/PlacementMonitoringPage';
import AiCenterPage from './pages/admin/AiCenterPage';
import SystemHealthPage from './pages/admin/SystemHealthPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import ReportsPage from './pages/admin/ReportsPage';
import SettingsPage from './pages/admin/SettingsPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import PageTitleManager from './components/PageTitleManager';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PageTitleManager />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/awaiting-approval" element={<AwaitingApprovalPage />} />

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
          <Route
            path="/recruiter/jobs"
            element={
              <RouteGuard allowedRoles={['recruiter']}>
                <RecruiterJobsPage />
              </RouteGuard>
            }
          />
          <Route
            path="/recruiter/applicants"
            element={
              <RouteGuard allowedRoles={['recruiter']}>
                <RecruiterApplicantsPage />
              </RouteGuard>
            }
          />
          <Route
            path="/recruiter/profile"
            element={
              <RouteGuard allowedRoles={['recruiter']}>
                <RecruiterProfilePage />
              </RouteGuard>
            }
          />

          {/* Protected Routes - TPO */}
          <Route
            path="/tpo/dashboard"
            element={
              <RouteGuard allowedRoles={['tpo', 'admin']}>
                <TpoDashboardPage />
              </RouteGuard>
            }
          />
          <Route
            path="/tpo/approvals"
            element={
              <RouteGuard allowedRoles={['tpo', 'admin']}>
                <TpoApprovalsPage />
              </RouteGuard>
            }
          />
          <Route
            path="/tpo/students"
            element={
              <RouteGuard allowedRoles={['tpo', 'admin']}>
                <TpoStudentsPage />
              </RouteGuard>
            }
          />
          <Route
            path="/tpo/recruitment"
            element={
              <RouteGuard allowedRoles={['tpo', 'admin']}>
                <TpoRecruitmentPage />
              </RouteGuard>
            }
          />
          <Route
            path="/tpo/analytics"
            element={
              <RouteGuard allowedRoles={['tpo', 'admin']}>
                <TpoAnalyticsPage />
              </RouteGuard>
            }
          />
          <Route
            path="/tpo/audit"
            element={
              <RouteGuard allowedRoles={['tpo', 'admin']}>
                <TpoAuditPage />
              </RouteGuard>
            }
          />

          {/* Protected Routes - Admin Module */}
          <Route
            path="/admin/dashboard"
            element={
              <RouteGuard allowedRoles={['admin']}>
                <AdminDashboardPage />
              </RouteGuard>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RouteGuard allowedRoles={['admin']}>
                <UsersListPage title="User Governance & Management" />
              </RouteGuard>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <RouteGuard allowedRoles={['admin']}>
                <UserDetailPage />
              </RouteGuard>
            }
          />
          <Route
            path="/admin/students"
            element={
              <RouteGuard allowedRoles={['admin']}>
                <UsersListPage initialRole="student" title="Student Directory" />
              </RouteGuard>
            }
          />
          <Route
            path="/admin/recruiters"
            element={
              <RouteGuard allowedRoles={['admin']}>
                <UsersListPage initialRole="recruiter" title="Recruiter Directory" />
              </RouteGuard>
            }
          />
          <Route
            path="/admin/tpos"
            element={
              <RouteGuard allowedRoles={['admin']}>
                <UsersListPage initialRole="tpo" title="TPO / Institution Directory" />
              </RouteGuard>
            }
          />
          <Route
            path="/admin/roles"
            element={
              <RouteGuard allowedRoles={['admin']}>
                <RolesPage />
              </RouteGuard>
            }
          />
          <Route
            path="/admin/placement"
            element={
              <RouteGuard allowedRoles={['admin']}>
                <PlacementMonitoringPage />
              </RouteGuard>
            }
          />
          <Route
            path="/admin/ai-center"
            element={
              <RouteGuard allowedRoles={['admin']}>
                <AiCenterPage />
              </RouteGuard>
            }
          />
          <Route
            path="/admin/system"
            element={
              <RouteGuard allowedRoles={['admin']}>
                <SystemHealthPage />
              </RouteGuard>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <RouteGuard allowedRoles={['admin']}>
                <AuditLogsPage />
              </RouteGuard>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <RouteGuard allowedRoles={['admin']}>
                <ReportsPage />
              </RouteGuard>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <RouteGuard allowedRoles={['admin']}>
                <SettingsPage />
              </RouteGuard>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <RouteGuard allowedRoles={['admin']}>
                <AdminProfilePage />
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
