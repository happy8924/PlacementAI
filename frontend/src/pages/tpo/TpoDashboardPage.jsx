import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TpoLayout from '../../components/tpo/TpoLayout';
import { getTpoDashboardMetrics } from '../../services/tpo';
import {
  Users,
  Building2,
  Briefcase,
  Send,
  Award,
  Clock,
  ArrowRight,
  ShieldAlert,
  Activity,
  UserCheck,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function TpoDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [recentAudits, setRecentAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTpoDashboardMetrics();
      if (res.success) {
        setMetrics(res.metrics);
        setRecentAudits(res.recent_audits || []);
      }
    } catch (err) {
      console.error('Failed to load TPO metrics:', err);
      setError(err.response?.data?.detail || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const statCards = [
    {
      title: 'Total Students',
      value: metrics?.total_students ?? 0,
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      textColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      link: '/tpo/students'
    },
    {
      title: 'Registered Recruiters',
      value: metrics?.total_recruiters ?? 0,
      icon: Building2,
      color: 'from-purple-600 to-pink-600',
      textColor: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      link: '/tpo/approvals'
    },
    {
      title: 'Placement Drives / Jobs',
      value: metrics?.total_jobs ?? 0,
      icon: Briefcase,
      color: 'from-emerald-600 to-teal-600',
      textColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      link: '/tpo/recruitment'
    },
    {
      title: 'Applications Logged',
      value: metrics?.total_applications ?? 0,
      icon: Send,
      color: 'from-amber-600 to-orange-600',
      textColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      link: '/tpo/recruitment'
    },
    {
      title: 'Offers & Placed',
      value: metrics?.total_placed ?? 0,
      icon: Award,
      color: 'from-rose-600 to-red-600',
      textColor: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      link: '/tpo/analytics'
    },
    {
      title: 'Pending Approvals',
      value: (metrics?.pending_students || 0) + (metrics?.pending_recruiters || 0) + (metrics?.pending_jobs || 0),
      icon: Clock,
      color: 'from-amber-500 to-yellow-500',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/15',
      badge: 'Action Required',
      link: '/tpo/approvals'
    }
  ];

  return (
    <TpoLayout title="TPO Executive Dashboard">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-blue-900/20 to-card-bg border border-indigo-500/20 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Institution Portal
            </span>
            <span className="text-xs text-secondary font-mono">Academic Year 2026-27</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-primary tracking-tight">
            Placement Operations & Moderation Hub
          </h2>
          <p className="text-xs text-secondary font-mono">
            Review onboarding requests, monitor drive eligibility, track candidate offers, and audit operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-secondary border border-theme hover:bg-card-bg text-secondary hover:text-primary rounded-xl font-mono text-xs font-semibold transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/tpo/approvals"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-mono text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            <UserCheck className="w-4 h-4" />
            <span>Open Approvals Queue</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 font-mono text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Link
              key={i}
              to={c.link}
              className="group p-5 rounded-2xl bg-card-bg border border-theme hover:border-indigo-500/40 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-secondary uppercase tracking-wider">
                  {c.title}
                </span>
                <div className={`w-10 h-10 rounded-xl ${c.bgColor} ${c.textColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-extrabold text-primary font-mono">
                  {loading ? (
                    <div className="w-16 h-8 bg-secondary rounded animate-pulse" />
                  ) : (
                    c.value
                  )}
                </div>
                {c.badge && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {c.badge}
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-theme flex items-center justify-between text-[11px] font-mono text-secondary group-hover:text-indigo-400 transition-colors">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Shortcuts & Pending Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pending Breakdown Box */}
        <div className="p-6 rounded-2xl bg-card-bg border border-theme shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-primary uppercase font-mono tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Pending Moderation
            </h3>
            <Link
              to="/tpo/approvals"
              className="text-xs font-mono text-indigo-400 hover:underline flex items-center gap-1"
            >
              Review All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-secondary border border-theme flex items-center justify-between">
              <span className="text-secondary">Student Registrations</span>
              <span className="font-bold text-primary px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {metrics?.pending_students ?? 0}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-secondary border border-theme flex items-center justify-between">
              <span className="text-secondary">Recruiter Corporate Accounts</span>
              <span className="font-bold text-primary px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {metrics?.pending_recruiters ?? 0}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-secondary border border-theme flex items-center justify-between">
              <span className="text-secondary">Job Drive Posts</span>
              <span className="font-bold text-primary px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {metrics?.pending_jobs ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Audit Timeline Preview */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-card-bg border border-theme shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-primary uppercase font-mono tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Recent Institutional Activity
            </h3>
            <Link
              to="/tpo/audit"
              className="text-xs font-mono text-indigo-400 hover:underline flex items-center gap-1"
            >
              View Full Audit <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-12 bg-secondary rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentAudits.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-secondary">
              No recent audit records found.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentAudits.slice(0, 5).map((log, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-secondary border border-theme flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {log.action}
                    </span>
                    <span className="text-primary truncate">
                      {log.details?.name || log.details?.title || log.details?.target_name || log.actor_name || 'System Event'}
                    </span>
                  </div>
                  <span className="text-secondary text-[11px] flex-shrink-0 ml-2">
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </TpoLayout>
  );
}
