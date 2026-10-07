import React, { useState, useEffect } from 'react';
import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar';
import RecruiterHeader from '../../components/recruiter/RecruiterHeader';
import {
  Briefcase,
  Users,
  UserCheck,
  Calendar,
  Award,
  CheckCircle2,
  TrendingUp,
  Activity,
  ArrowRight,
  Loader2,
  Sparkles,
  Zap,
  Check,
  FileText
} from 'lucide-react';
import { getRecruiterDashboard, getCandidateRecommendations } from '../../services/recruiter';
import { Link } from 'react-router-dom';

export default function RecruiterDashboardPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, recRes] = await Promise.all([
          getRecruiterDashboard(),
          getCandidateRecommendations()
        ]);

        if (dashRes.success) setData(dashRes);
        if (recRes.success) setRecommendations(recRes.recommendations || []);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load recruiter metrics.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = data?.stats || {
    active_jobs: 0,
    total_applicants: 0,
    shortlisted: 0,
    interviews_scheduled: 0,
    offered: 0,
    selected: 0
  };

  const pipeline = data?.pipeline || {
    applied: 0,
    shortlisted: 0,
    interviewed: 0,
    offered: 0,
    selected: 0
  };

  const recentApplicants = data?.recent_applicants || [];
  const recentActivity = data?.recent_activity || [];

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      <RecruiterSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <RecruiterHeader
          title="Recruiter Command Center"
          subtitle="Real-time company job drives, AI candidate recommendation feed, and hiring pipeline"
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="mt-4 text-secondary text-sm">Loading recruitment dashboard & recommendation engine...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-6 text-center text-sm font-mono">
              {error}
            </div>
          ) : (
            <>
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-card-bg border border-theme rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-blue-600">
                    <Briefcase className="w-5 h-5" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded">Active</span>
                  </div>
                  <p className="text-2xl font-extrabold text-primary">{stats.active_jobs}</p>
                  <p className="text-xs text-secondary font-medium">Active Jobs</p>
                </div>

                <div className="bg-card-bg border border-theme rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-indigo-600">
                    <Users className="w-5 h-5" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded">Total</span>
                  </div>
                  <p className="text-2xl font-extrabold text-primary">{stats.total_applicants}</p>
                  <p className="text-xs text-secondary font-medium">Applicants</p>
                </div>

                <div className="bg-card-bg border border-theme rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-purple-600">
                    <UserCheck className="w-5 h-5" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded">Stage 2</span>
                  </div>
                  <p className="text-2xl font-extrabold text-primary">{stats.shortlisted}</p>
                  <p className="text-xs text-secondary font-medium">Shortlisted</p>
                </div>

                <div className="bg-card-bg border border-theme rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-amber-600">
                    <Calendar className="w-5 h-5" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded">Stage 3</span>
                  </div>
                  <p className="text-2xl font-extrabold text-primary">{stats.interviews_scheduled}</p>
                  <p className="text-xs text-secondary font-medium">Interviews</p>
                </div>

                <div className="bg-card-bg border border-theme rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-emerald-600">
                    <Award className="w-5 h-5" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">Stage 4</span>
                  </div>
                  <p className="text-2xl font-extrabold text-primary">{stats.offered}</p>
                  <p className="text-xs text-secondary font-medium">Offered</p>
                </div>

                <div className="bg-card-bg border border-theme rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-teal-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-teal-500/10 px-2 py-0.5 rounded">Final</span>
                  </div>
                  <p className="text-2xl font-extrabold text-primary">{stats.selected}</p>
                  <p className="text-xs text-secondary font-medium">Selected</p>
                </div>
              </div>

              {/* Candidate Recommendation Feed */}
              <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-primary">Candidate Recommendation Feed</h3>
                      <p className="text-xs text-secondary font-mono">High Resume Match & Interview Readiness (IRS) candidates</p>
                    </div>
                  </div>
                  <Link to="/recruiter/applicants" className="text-xs font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
                    View Pipeline <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {recommendations.length === 0 ? (
                  <div className="py-8 text-center text-secondary text-xs font-mono">
                    No candidate recommendations available at the moment.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {recommendations.map((cand, idx) => (
                      <div key={idx} className="p-4 bg-secondary/30 rounded-xl border border-theme hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-sm text-primary">{cand.student_name}</h4>
                              <p className="text-[11px] text-secondary font-mono">{cand.branch} • CGPA {cand.cgpa}</p>
                            </div>
                            <span className="text-[10px] font-mono font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              IRS {cand.irs_score}%
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {cand.resume_match_score}% Resume Match
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {(cand.skills || []).slice(0, 4).map((sk, skIdx) => (
                              <span key={skIdx} className="text-[9px] font-mono bg-card-bg text-secondary border border-theme px-1.5 py-0.5 rounded">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-theme flex items-center justify-between">
                          <span className="text-[10px] font-mono text-secondary truncate max-w-[140px]">
                            {cand.target_job_title}
                          </span>
                          <Link
                            to="/recruiter/applicants"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-sm"
                          >
                            View & Shortlist
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hiring Funnel Pipeline Bar */}
              <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-base text-primary">Candidate Hiring Pipeline</h3>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-3 pt-2">
                  <div className="p-4 bg-secondary/50 rounded-xl border border-theme space-y-1 text-center">
                    <span className="text-[10px] font-mono font-bold text-secondary uppercase">Applied</span>
                    <p className="text-xl font-extrabold text-primary">{pipeline.applied}</p>
                  </div>

                  <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/20 space-y-1 text-center">
                    <span className="text-[10px] font-mono font-bold text-purple-600 uppercase">Shortlisted</span>
                    <p className="text-xl font-extrabold text-purple-600">{pipeline.shortlisted}</p>
                  </div>

                  <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 space-y-1 text-center">
                    <span className="text-[10px] font-mono font-bold text-amber-600 uppercase">Interviewed</span>
                    <p className="text-xl font-extrabold text-amber-600">{pipeline.interviewed}</p>
                  </div>

                  <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-1 text-center">
                    <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase">Offered</span>
                    <p className="text-xl font-extrabold text-emerald-600">{pipeline.offered}</p>
                  </div>

                  <div className="p-4 bg-teal-500/5 rounded-xl border border-teal-500/20 space-y-1 text-center">
                    <span className="text-[10px] font-mono font-bold text-teal-600 uppercase">Selected</span>
                    <p className="text-xl font-extrabold text-teal-600">{pipeline.selected}</p>
                  </div>
                </div>
              </div>

              {/* Grid: Recent Applicants & Activity Audit */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-theme pb-4">
                    <h3 className="font-bold text-base text-primary flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      Recent Applications
                    </h3>
                    <Link to="/recruiter/applicants" className="text-xs font-bold text-indigo-600 hover:text-indigo-500">
                      View All
                    </Link>
                  </div>

                  {recentApplicants.length === 0 ? (
                    <div className="py-12 text-center text-secondary text-sm">
                      No applications received yet for your posted jobs.
                    </div>
                  ) : (
                    <div className="divide-y divide-theme">
                      {recentApplicants.map((app) => (
                        <div key={app.id} className="py-3.5 flex items-center justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-primary truncate">{app.student_name}</p>
                            <p className="text-xs text-secondary truncate">{app.job_title} • {app.branch}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="inline-block text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600">
                              {app.status}
                            </span>
                            <p className="text-[10px] text-secondary font-mono mt-1">{app.applied_at}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="border-b border-theme pb-4">
                    <h3 className="font-bold text-base text-primary flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      Recruiter Activity Log
                    </h3>
                  </div>

                  {recentActivity.length === 0 ? (
                    <div className="py-12 text-center text-secondary text-xs font-mono">
                      No recent audit logs available.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentActivity.map((log, idx) => (
                        <div key={idx} className="p-3 bg-secondary/40 rounded-xl border border-theme text-xs space-y-1">
                          <p className="font-mono font-bold text-indigo-600 text-[11px] uppercase tracking-wider">{log.action}</p>
                          <p className="text-secondary font-sans text-xs">
                            {log.details?.title ? `Job: ${log.details.title}` : log.details?.dispatched ? `Sent ${log.details.dispatched} emails` : 'Action executed.'}
                          </p>
                          <p className="text-[10px] text-secondary font-mono text-right">{log.timestamp}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}
