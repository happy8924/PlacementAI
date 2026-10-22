import React, { useEffect, useState } from 'react';
import TpoLayout from '../../components/tpo/TpoLayout';
import { getTpoAuditLogs } from '../../services/tpo';
import {
  FileCheck2,
  Search,
  Filter,
  Clock,
  ShieldCheck,
  User,
  AlertCircle,
  RefreshCw,
  Eye
} from 'lucide-react';

export default function TpoAuditPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTpoAuditLogs(actionFilter, 100);
      if (res.success) {
        setLogs(res.logs);
        setTotal(res.total);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError(err.response?.data?.detail || 'Failed to retrieve institutional audit timeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  return (
    <TpoLayout title="Institutional Audit & Compliance Timeline">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-primary tracking-tight font-sans">
            Immutable Audit Trail
          </h2>
          <p className="text-xs text-secondary font-mono">
            Read-only chronological timeline of registrations, moderation approvals, rejections, and security events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-secondary border border-theme rounded-xl text-primary font-mono text-xs focus:outline-none focus:border-indigo-500/50"
          >
            <option value="">All Institutional Events</option>
            <option value="USER_REGISTERED">New Registrations</option>
            <option value="TPO_USER_APPROVE">TPO Approvals</option>
            <option value="TPO_USER_REJECT">TPO Rejections</option>
            <option value="TPO_JOB">Job Moderations</option>
          </select>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-secondary border border-theme hover:bg-card-bg text-secondary hover:text-primary rounded-xl font-mono text-xs font-semibold transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-mono text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Audit Log Timeline Table */}
      <div className="bg-card-bg border border-theme rounded-2xl shadow-sm overflow-hidden font-mono text-xs">
        {loading ? (
          <div className="p-12 text-center text-secondary space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
            <p>Querying immutable activity logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-secondary space-y-2">
            <FileCheck2 className="w-8 h-8 mx-auto text-indigo-400" />
            <p className="font-bold text-primary">No Audit Events Logged</p>
            <p className="text-[11px]">Audit timeline is currently clear.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-secondary/50 border-b border-theme text-secondary text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Target / Entity</th>
                  <th className="p-4">Details / Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {logs.map((log) => {
                  const details = log.details || {};
                  const isApproval = log.action?.includes('APPROVE');
                  const isRejection = log.action?.includes('REJECT');

                  return (
                    <tr key={log.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-4 text-secondary text-[11px] whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isApproval
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isRejection
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-primary font-semibold">
                        {log.actor_name || log.role || 'System'}
                      </td>
                      <td className="p-4 text-primary">
                        {details.target_name || details.name || details.title || details.target_user_id || 'System Entity'}
                      </td>
                      <td className="p-4 text-secondary text-[11px] max-w-xs truncate">
                        {details.reason ? (
                          <span className="text-red-400">Reason: {details.reason}</span>
                        ) : details.email ? (
                          <span>Email: {details.email}</span>
                        ) : (
                          <span>Decision logged</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </TpoLayout>
  );
}
