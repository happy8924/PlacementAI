import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAdminDashboard } from '../../services/admin';
import {
  Users,
  GraduationCap,
  Building2,
  Building,
  Briefcase,
  Cpu,
  Activity,
  ArrowRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      setError('Unable to load real-time statistics. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Admin Overview">
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
          <span className="font-mono text-xs text-secondary tracking-widest uppercase animate-pulse">
            Connecting to Database & Aggregating Metrics...
          </span>
        </div>
      </AdminLayout>
    );
  }

  const stats = data?.stats || {};
  const userStats = stats.users || {};
  const placementStats = stats.placement || {};
  const aiStats = stats.ai || {};

  return (
    <AdminLayout title="Admin Overview">
      <div className="space-y-6">
        
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono rounded-xl flex items-center justify-between">
            <span>✕ {error}</span>
            <button onClick={fetchDashboard} className="underline font-bold">Retry</button>
          </div>
        )}

        {/* Dashboard Banner */}
        <div className="bg-gradient-to-r from-red-600/10 via-indigo-600/10 to-transparent border border-theme p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden sm:block">
            <ShieldAlert className="w-36 h-36 text-primary" />
          </div>
          <div className="relative z-10 space-y-2 max-w-2xl">
            <div className="inline-block px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 font-mono text-[10px] uppercase font-bold rounded">
              Platform Governance Terminal
            </div>
            <h2 className="text-2xl font-extrabold text-primary tracking-tight">System Control & Operations</h2>
            <p className="text-xs text-secondary font-mono leading-relaxed">
              Real-time monitoring across candidate profiles, recruitment drives, AI resume processing, and security audit logs.
            </p>
          </div>
        </div>

        {/* Core Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-card-bg border border-theme p-5 rounded-xl space-y-3 shadow-sm hover:border-red-500/30 transition-all">
            <div className="flex items-center justify-between text-secondary">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Total Users</span>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-primary font-mono">{userStats.total || 0}</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">{userStats.active || 0} Active</span>
            </div>
            <div className="text-[10px] font-mono text-secondary flex justify-between border-t border-theme pt-2">
              <span>Students: {userStats.students || 0}</span>
              <span>Recruiters: {userStats.recruiters || 0}</span>
            </div>
          </div>

          <div className="bg-card-bg border border-theme p-5 rounded-xl space-y-3 shadow-sm hover:border-red-500/30 transition-all">
            <div className="flex items-center justify-between text-secondary">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Placement Drives</span>
              <Briefcase className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-primary font-mono">{placementStats.jobs || 0}</span>
              <span className="text-[10px] font-mono text-blue-400 font-bold">{placementStats.active_jobs || 0} Live</span>
            </div>
            <div className="text-[10px] font-mono text-secondary flex justify-between border-t border-theme pt-2">
              <span>Applications: {placementStats.applications || 0}</span>
              <span>Selected: {placementStats.placements || 0}</span>
            </div>
          </div>

          <div className="bg-card-bg border border-theme p-5 rounded-xl space-y-3 shadow-sm hover:border-red-500/30 transition-all">
            <div className="flex items-center justify-between text-secondary">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">AI Intelligence</span>
              <Cpu className="w-5 h-5 text-purple-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-primary font-mono">{aiStats.analyses || 0}</span>
              <span className="text-[10px] font-mono text-purple-400 font-bold">Analyses</span>
            </div>
            <div className="text-[10px] font-mono text-secondary flex justify-between border-t border-theme pt-2">
              <span>Resumes: {aiStats.resumes || 0}</span>
              <span>Interviews: {aiStats.interviews || 0}</span>
            </div>
          </div>

          <div className="bg-card-bg border border-theme p-5 rounded-xl space-y-3 shadow-sm hover:border-red-500/30 transition-all">
            <div className="flex items-center justify-between text-secondary">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">System Governance</span>
              <Activity className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-primary font-mono">100%</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">DB Online</span>
            </div>
            <div className="text-[10px] font-mono text-secondary flex justify-between border-t border-theme pt-2">
              <span>Pending Approval:</span>
              <span className="text-amber-400 font-bold">{userStats.pending_approval || 0}</span>
            </div>
          </div>

        </div>

        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Recent Users Table */}
          <div className="lg:col-span-2 bg-card-bg border border-theme rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold text-primary font-mono">Recent User Signups</h3>
                <p className="text-[11px] text-secondary font-mono">Latest registered accounts across roles</p>
              </div>
              <Link to="/admin/users" className="text-xs font-mono font-bold text-red-500 hover:underline flex items-center gap-1">
                View All Users <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {(!data?.recent_users || data.recent_users.length === 0) ? (
              <div className="p-8 text-center text-secondary font-mono text-xs border border-dashed border-theme rounded-xl">
                No user registration records found in database.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-theme text-[10px] text-secondary uppercase tracking-wider">
                      <th className="pb-3 font-semibold">User</th>
                      <th className="pb-3 font-semibold">Role</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme">
                    {data.recent_users.map((u) => (
                      <tr key={u.id} className="hover:bg-secondary/40 transition-colors">
                        <td className="py-3 pr-2">
                          <div className="font-bold text-primary">{u.name}</div>
                          <div className="text-[10px] text-secondary">{u.email}</div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            u.role === 'recruiter' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                            u.role === 'tpo' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3">
                          {u.is_active !== false ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400 text-[10px] font-bold">
                              <XCircle className="w-3 h-3" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <Link to={`/admin/users/${u.id}`} className="text-secondary hover:text-primary text-[10px] underline">
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Column: Recent Audit Activity & Quick Navigation */}
          <div className="space-y-6">
            
            {/* Quick Actions Card */}
            <div className="bg-card-bg border border-theme rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-primary font-mono uppercase tracking-wider">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <Link to="/admin/students" className="p-3 bg-secondary border border-theme rounded-xl hover:border-red-500/30 transition-all flex flex-col items-center text-center gap-1 text-secondary hover:text-primary">
                  <GraduationCap className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-[11px]">Students</span>
                </Link>
                <Link to="/admin/recruiters" className="p-3 bg-secondary border border-theme rounded-xl hover:border-red-500/30 transition-all flex flex-col items-center text-center gap-1 text-secondary hover:text-primary">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  <span className="font-bold text-[11px]">Recruiters</span>
                </Link>
                <Link to="/admin/placement" className="p-3 bg-secondary border border-theme rounded-xl hover:border-red-500/30 transition-all flex flex-col items-center text-center gap-1 text-secondary hover:text-primary">
                  <Briefcase className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-[11px]">Jobs</span>
                </Link>
                <Link to="/admin/audit" className="p-3 bg-secondary border border-theme rounded-xl hover:border-red-500/30 transition-all flex flex-col items-center text-center gap-1 text-secondary hover:text-primary">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span className="font-bold text-[11px]">Audit Logs</span>
                </Link>
              </div>
            </div>

            {/* Audit Feed */}
            <div className="bg-card-bg border border-theme rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-primary font-mono uppercase tracking-wider">Audit Feed</h3>
                <Link to="/admin/audit" className="text-[10px] font-mono text-secondary hover:text-primary underline">
                  All Activity
                </Link>
              </div>

              {(!data?.recent_logs || data.recent_logs.length === 0) ? (
                <p className="text-xs font-mono text-secondary">No recent audit logs recorded.</p>
              ) : (
                <div className="space-y-3">
                  {data.recent_logs.map((log) => (
                    <div key={log.id} className="p-3 bg-secondary/50 border border-theme rounded-xl space-y-1 font-mono text-[11px]">
                      <div className="flex items-center justify-between text-secondary">
                        <span className="font-bold text-red-400">{log.action}</span>
                        <span className="text-[9px] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recent'}
                        </span>
                      </div>
                      <p className="text-primary truncate">{JSON.stringify(log.details || {})}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
