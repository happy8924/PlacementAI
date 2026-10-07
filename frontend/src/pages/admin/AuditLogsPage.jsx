import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAuditLogs } from '../../services/admin';
import { FileCheck2, Search, Clock, User, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 20;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async (searchTerm = search) => {
    setLoading(true);
    setError('');
    try {
      const res = await getAuditLogs({ page, limit, search: searchTerm });
      if (res.success) {
        setLogs(res.logs);
        setTotal(res.total);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Could not query activity logs from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs(search);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <AdminLayout title="Security & Audit Trails">
      <div className="space-y-6 font-mono">
        
        {/* Header */}
        <div className="bg-card-bg border border-theme p-6 rounded-2xl space-y-1">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-extrabold text-primary uppercase tracking-tight">
              Audit Logs & Security Trail
            </h2>
          </div>
          <p className="text-xs text-secondary">
            System-wide security event logging, privilege changes, administrative updates, and user action tracking.
          </p>
        </div>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl">✕ {error}</div>}

        {/* Search */}
        <form onSubmit={handleSearch} className="bg-card-bg border border-theme p-4 rounded-xl flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by action name or user ID..."
              className="w-full pl-9 pr-3 py-2 border border-theme bg-secondary text-primary rounded-lg text-xs focus:outline-none focus:border-red-500"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700">
            Filter Logs
          </button>
        </form>

        {/* Logs Table */}
        <div className="bg-card-bg border border-theme rounded-2xl overflow-hidden text-xs">
          {loading ? (
            <div className="p-12 text-center text-secondary">
              <div className="w-8 h-8 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-2"></div>
              Querying activity logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-secondary">No activity logs recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-theme text-[10px] text-secondary uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Action</th>
                    <th className="py-3 px-4 font-semibold">Initiated By</th>
                    <th className="py-3 px-4 font-semibold">Event Payload / Details</th>
                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-red-400">{l.action}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-primary">{l.user_name || 'System User'}</div>
                        <div className="text-[10px] text-secondary">{l.user_email || l.user_id}</div>
                      </td>
                      <td className="py-3.5 px-4 text-secondary max-w-xs truncate">
                        {JSON.stringify(l.details || {})}
                      </td>
                      <td className="py-3.5 px-4 text-secondary">
                        {l.timestamp ? new Date(l.timestamp).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-theme flex items-center justify-between text-secondary">
              <div>Page {page} of {totalPages} ({total} logs)</div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-1.5 border border-theme rounded-lg bg-secondary disabled:opacity-40 hover:text-primary"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-1.5 border border-theme rounded-lg bg-secondary disabled:opacity-40 hover:text-primary"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
