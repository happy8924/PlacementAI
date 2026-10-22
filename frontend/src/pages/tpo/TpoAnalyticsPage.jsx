import React, { useEffect, useState } from 'react';
import TpoLayout from '../../components/tpo/TpoLayout';
import { getTpoPlacementAnalytics } from '../../services/tpo';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Building2,
  Briefcase,
  AlertCircle,
  RefreshCw,
  PieChart,
  Download
} from 'lucide-react';

export default function TpoAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTpoPlacementAnalytics();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err.response?.data?.detail || 'Failed to aggregate placement analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const funnel = data?.application_funnel || {};
  const branchSummary = data?.branch_summary || [];

  return (
    <TpoLayout title="Placement Analytics & Institutional Intelligence">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-primary tracking-tight font-sans">
            Campus Placement Intelligence
          </h2>
          <p className="text-xs text-secondary font-mono">
            Branch-wise success rates, hiring funnel velocity, and recruitment outcome metrics.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 bg-secondary border border-theme hover:bg-card-bg text-secondary hover:text-primary rounded-xl font-mono text-xs font-semibold transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Recalculate
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-mono text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Recruitment Funnel Overview */}
      <div className="p-6 rounded-2xl bg-card-bg border border-theme shadow-sm space-y-4 font-mono text-xs">
        <h3 className="font-extrabold text-sm text-primary uppercase tracking-wider flex items-center gap-2 font-mono">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          Overall Placement Funnel
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-secondary border border-theme text-center">
            <span className="text-[10px] text-secondary uppercase font-bold">Applications</span>
            <div className="text-2xl font-extrabold text-primary mt-1">{funnel.total_applications ?? 0}</div>
            <span className="text-[10px] text-secondary">Initiated</span>
          </div>

          <div className="p-4 rounded-xl bg-secondary border border-theme text-center">
            <span className="text-[10px] text-indigo-400 uppercase font-bold">Shortlisted</span>
            <div className="text-2xl font-extrabold text-indigo-400 mt-1">{funnel.shortlisted ?? 0}</div>
            <span className="text-[10px] text-secondary">Screened In</span>
          </div>

          <div className="p-4 rounded-xl bg-secondary border border-theme text-center">
            <span className="text-[10px] text-purple-400 uppercase font-bold">Interviews</span>
            <div className="text-2xl font-extrabold text-purple-400 mt-1">{funnel.interviewing ?? 0}</div>
            <span className="text-[10px] text-secondary">Scheduled</span>
          </div>

          <div className="p-4 rounded-xl bg-secondary border border-theme text-center">
            <span className="text-[10px] text-emerald-400 uppercase font-bold">Offers / Placed</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{funnel.offered ?? 0}</div>
            <span className="text-[10px] text-secondary">Final Selected</span>
          </div>

          <div className="p-4 rounded-xl bg-secondary border border-theme text-center">
            <span className="text-[10px] text-red-400 uppercase font-bold">Rejected</span>
            <div className="text-2xl font-extrabold text-red-400 mt-1">{funnel.rejected ?? 0}</div>
            <span className="text-[10px] text-secondary">Did Not Clear</span>
          </div>
        </div>
      </div>

      {/* Branch-wise Performance Table */}
      <div className="p-6 rounded-2xl bg-card-bg border border-theme shadow-sm space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Branch-Wise Placement Breakdown
          </h3>
          <span className="text-[10px] text-secondary uppercase font-bold">Institutional Cohort</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-secondary space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
            <p>Aggregating academic cohorts...</p>
          </div>
        ) : branchSummary.length === 0 ? (
          <div className="p-8 text-center text-secondary">
            No student branch records recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto border border-theme rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary text-secondary text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Department / Branch</th>
                  <th className="p-3.5">Enrolled Students</th>
                  <th className="p-3.5">Actively Applied</th>
                  <th className="p-3.5">Confirmed Placed</th>
                  <th className="p-3.5">Placement Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {branchSummary.map((b, idx) => (
                  <tr key={idx} className="hover:bg-secondary/40 transition-colors">
                    <td className="p-3.5 font-bold text-primary">{b.branch}</td>
                    <td className="p-3.5 text-secondary">{b.total_students}</td>
                    <td className="p-3.5 text-indigo-400 font-semibold">{b.applied}</td>
                    <td className="p-3.5 text-emerald-400 font-bold">{b.placed}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-secondary rounded-full h-2 border border-theme overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, b.placement_rate_pct)}%` }}
                          />
                        </div>
                        <span className="font-bold text-primary">{b.placement_rate_pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </TpoLayout>
  );
}
