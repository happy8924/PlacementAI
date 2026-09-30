import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getPlacementReports } from '../../services/admin';
import { BarChart3, GraduationCap, Briefcase, Award, TrendingUp, DollarSign } from 'lucide-react';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPlacementReports();
      if (res.success) {
        setReport(res.report);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Could not calculate aggregated reports from database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Placement & Analytics Reports">
      <div className="space-y-6 font-mono">
        
        {/* Header */}
        <div className="bg-card-bg border border-theme p-6 rounded-2xl space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-extrabold text-primary uppercase tracking-tight">
              Institutional Placement Reports
            </h2>
          </div>
          <p className="text-xs text-secondary">
            Aggregated metrics for institutional reporting, salary package distribution, and placement drive conversions.
          </p>
        </div>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl">✕ {error}</div>}

        {loading ? (
          <div className="p-12 text-center text-xs text-secondary">
            <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>
            Compiling database analytical report...
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="bg-card-bg border border-theme p-6 rounded-2xl space-y-2">
                <div className="text-[11px] text-secondary font-bold uppercase flex items-center justify-between">
                  <span>Placement Rate</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-400">{report?.placement_rate_percentage || 0}%</div>
                <div className="text-[10px] text-secondary">{report?.placed_students || 0} of {report?.total_students || 0} candidates placed</div>
              </div>

              <div className="bg-card-bg border border-theme p-6 rounded-2xl space-y-2">
                <div className="text-[11px] text-secondary font-bold uppercase flex items-center justify-between">
                  <span>Average CTC Package</span>
                  <DollarSign className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-extrabold text-indigo-400">{report?.average_package_lpa || 0} LPA</div>
                <div className="text-[10px] text-secondary">Across verified active job offers</div>
              </div>

              <div className="bg-card-bg border border-theme p-6 rounded-2xl space-y-2">
                <div className="text-[11px] text-secondary font-bold uppercase flex items-center justify-between">
                  <span>Highest CTC Package</span>
                  <Award className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-extrabold text-purple-400">{report?.highest_package_lpa || 0} LPA</div>
                <div className="text-[10px] text-secondary">Peak candidate offer recorded</div>
              </div>
            </div>

            {/* Summary Details */}
            <div className="bg-card-bg border border-theme rounded-2xl p-6 space-y-4 text-xs">
              <h3 className="text-sm font-extrabold text-primary uppercase tracking-wider">Report Telemetry</h3>
              <div className="space-y-2 text-secondary">
                <div><span className="text-primary font-bold">Total Registered Candidates:</span> {report?.total_students || 0}</div>
                <div><span className="text-primary font-bold">Total Active Corporate Jobs:</span> {report?.total_jobs || 0}</div>
                <div><span className="text-primary font-bold">Report Generated At:</span> {report?.generated_at ? new Date(report.generated_at).toLocaleString() : 'N/A'}</div>
              </div>
            </div>

          </div>
        )}

      </div>
    </AdminLayout>
  );
}
