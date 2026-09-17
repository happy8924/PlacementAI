import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getStudentDashboard } from '../../services/student';
import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import {
  Sparkles,
  FileText,
  Video,
  Map,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldCheck,
  User
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user, studentProfile, isProfileComplete } = useAuth();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const res = await getStudentDashboard();
        if (res.success) {
          setDashboardData(res);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const studentName = studentProfile?.full_name || user?.name || 'Student';
  const profilePct = dashboardData?.profile_completion?.percentage ?? (studentProfile?.profile_completion || 0);

  // Resume Info
  const hasResume = dashboardData?.resume_status?.has_resume || false;
  const resumeName = dashboardData?.resume_status?.file_name;
  const atsScore = dashboardData?.stats?.ats_score;

  // Interview Readiness Score
  const readinessScore = dashboardData?.interview_readiness_score !== null && dashboardData?.interview_readiness_score !== undefined
    ? dashboardData.interview_readiness_score
    : (studentProfile?.interview_readiness_score !== null && studentProfile?.interview_readiness_score !== undefined
      ? studentProfile.interview_readiness_score
      : null);

  const applicationsCount = dashboardData?.stats?.applications_count ?? 0;
  const recentActivities = dashboardData?.recent_activities || [];

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      {/* Reusable Sidebar */}
      <StudentSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <StudentHeader
          title="Student Dashboard"
          subtitle="Placement Intelligence & Readiness Overview"
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8">
          
          {/* Welcome Banner */}
          <div className="relative overflow-hidden bg-card-bg border border-theme rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-xs font-mono font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  PlacementAI Workspace
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">
                  Welcome back, {studentName} 👋
                </h2>
                <p className="text-xs md:text-sm text-secondary">
                  Prepare smarter. Get interview-ready with PlacementAI intelligence.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/student/interview"
                  className="px-4 py-3 btn-brand-primary rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-md flex items-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  <Video className="w-4 h-4" />
                  Practice Interview
                </Link>
              </div>
            </div>
          </div>

          {/* Core Overview Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Profile Completion */}
            <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Profile Status
                  </span>
                  {isProfileComplete ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Complete
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      Incomplete
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-2xl font-extrabold text-primary">{profilePct}%</span>
                    <span className="text-xs font-mono text-secondary">Completion</span>
                  </div>
                  <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden border border-theme">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${profilePct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/student/profile"
                  className="w-full py-2.5 px-3 rounded-xl border border-theme bg-secondary text-primary hover:bg-theme text-xs font-mono font-bold flex items-center justify-between transition-colors"
                >
                  <span>{isProfileComplete ? 'View Profile' : 'Complete Your Profile'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-secondary" />
                </Link>
              </div>
            </div>

            {/* Card 2: Resume Status */}
            <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Resume Status
                  </span>
                  {hasResume ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Uploaded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-secondary text-secondary border border-theme">
                      Not Uploaded
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-lg font-bold text-primary truncate">
                    {hasResume ? (resumeName || 'Primary Resume.pdf') : 'No resume uploaded'}
                  </p>
                  <p className="text-xs text-secondary font-mono mt-0.5">
                    {hasResume ? 'Active for job applications' : 'Upload PDF resume for AI analysis'}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/student/resume"
                  className="w-full py-2.5 px-3 rounded-xl border border-theme bg-secondary text-primary hover:bg-theme text-xs font-mono font-bold flex items-center justify-between transition-colors"
                >
                  <span>{hasResume ? 'Manage Resume' : 'Upload Resume'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-secondary" />
                </Link>
              </div>
            </div>

            {/* Card 3: Interview Readiness */}
            <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                    Interview Readiness
                  </span>
                </div>

                <div>
                  <div className="text-2xl font-extrabold text-primary">
                    {readinessScore !== null ? `${readinessScore} / 100` : 'Not evaluated yet'}
                  </div>
                  <p className="text-xs text-secondary font-mono mt-0.5">
                    {readinessScore !== null ? 'Based on AI mock interviews' : 'Complete a mock interview to get evaluated'}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/student/interview"
                  className="w-full py-2.5 px-3 rounded-xl border border-theme bg-secondary text-primary hover:bg-theme text-xs font-mono font-bold flex items-center justify-between transition-colors"
                >
                  <span>Start AI Interview</span>
                  <ArrowRight className="w-3.5 h-3.5 text-secondary" />
                </Link>
              </div>
            </div>

          </div>

          {/* Quick Actions Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-secondary">
              Quick Actions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/student/resume"
                className="bg-card-bg border border-theme p-5 rounded-2xl shadow-sm hover:border-blue-500/40 hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary group-hover:text-blue-600 transition-colors">
                    Upload Resume
                  </h4>
                  <p className="text-xs text-secondary mt-1">Upload and manage your resume PDF</p>
                </div>
              </Link>

              <Link
                to="/student/interview"
                className="bg-card-bg border border-theme p-5 rounded-2xl shadow-sm hover:border-indigo-500/40 hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary group-hover:text-indigo-600 transition-colors">
                    Practice Interview
                  </h4>
                  <p className="text-xs text-secondary mt-1">Simulate AI mock technical interviews</p>
                </div>
              </Link>

              <Link
                to="/student/roadmap"
                className="bg-card-bg border border-theme p-5 rounded-2xl shadow-sm hover:border-teal-500/40 hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Map className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary group-hover:text-teal-600 transition-colors">
                    View AI Roadmap
                  </h4>
                  <p className="text-xs text-secondary mt-1">Personalized step-by-step skill roadmap</p>
                </div>
              </Link>

              <Link
                to="/student/jobs"
                className="bg-card-bg border border-theme p-5 rounded-2xl shadow-sm hover:border-purple-500/40 hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary group-hover:text-purple-600 transition-colors">
                    Explore Jobs
                  </h4>
                  <p className="text-xs text-secondary mt-1">Browse campus placement opportunities</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Stats & Recent Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Dashboard Stats (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-secondary">
                Performance Overview
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-card-bg border border-theme p-4 rounded-xl shadow-sm space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-secondary block">Completion</span>
                  <span className="text-xl font-extrabold text-primary">{profilePct}%</span>
                </div>

                <div className="bg-card-bg border border-theme p-4 rounded-xl shadow-sm space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-secondary block">Interview Score</span>
                  <span className="text-xl font-extrabold text-primary">
                    {readinessScore !== null ? readinessScore : '--'}
                  </span>
                </div>

                <div className="bg-card-bg border border-theme p-4 rounded-xl shadow-sm space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-secondary block">Applications</span>
                  <span className="text-xl font-extrabold text-primary">{applicationsCount}</span>
                </div>

                <div className="bg-card-bg border border-theme p-4 rounded-xl shadow-sm space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-secondary block">ATS Score</span>
                  <span className="text-xl font-extrabold text-primary">
                    {atsScore !== null && atsScore !== undefined ? atsScore : '--'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity (1 col) */}
            <div className="space-y-4">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-secondary flex items-center justify-between">
                <span>Recent Activity</span>
                <Activity className="w-4 h-4 text-secondary" />
              </h3>

              <div className="bg-card-bg border border-theme rounded-2xl p-5 shadow-sm space-y-3 min-h-[160px] flex flex-col justify-center">
                {recentActivities.length === 0 ? (
                  <div className="text-center py-6 space-y-2">
                    <Activity className="w-8 h-8 text-secondary/40 mx-auto" />
                    <p className="text-xs font-mono text-secondary">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivities.map((act) => (
                      <div key={act.id} className="flex items-start gap-3 text-xs border-b border-theme pb-2.5 last:border-0 last:pb-0">
                        <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-primary">{act.action}</p>
                          <p className="text-[10px] font-mono text-secondary">{new Date(act.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
