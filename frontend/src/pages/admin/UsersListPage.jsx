import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getUsersList, updateUserStatus, deleteUser } from '../../services/admin';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  GraduationCap,
  Building2,
  Building,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

export default function UsersListPage({ initialRole = null, title = "User Governance" }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const roleFilterParam = initialRole || searchParams.get('role') || '';
  
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  const [role, setRole] = useState(roleFilterParam);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, role, statusFilter]);

  const fetchUsers = async (searchTerm = search) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit,
      };
      if (role) params.role = role;
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await getUsersList(params);
      if (res.success) {
        setUsers(res.users);
        setTotal(res.total);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(search);
  };

  const handleToggleStatus = async (userId, currentActive) => {
    setActionLoading(userId);
    setError('');
    setSuccessMsg('');
    try {
      const res = await updateUserStatus(userId, { is_active: !currentActive });
      if (res.success) {
        setSuccessMsg(`User status updated to ${!currentActive ? 'Active' : 'Inactive'}.`);
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update user status.');
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <AdminLayout title={title}>
      <div className="space-y-6">
        
        {/* Header Title & Role Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card-bg border border-theme p-6 rounded-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-extrabold text-primary font-mono uppercase tracking-tight">{title}</h2>
            </div>
            <p className="text-xs text-secondary font-mono">
              Manage accounts, approval states, role assignments, and security governance ({total} users total)
            </p>
          </div>

          {!initialRole && (
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
              {[
                { label: 'All Roles', value: '' },
                { label: 'Students', value: 'student', icon: GraduationCap },
                { label: 'Recruiters', value: 'recruiter', icon: Building2 },
                { label: 'TPOs', value: 'tpo', icon: Building },
                { label: 'Admins', value: 'admin', icon: ShieldCheck },
              ].map((r) => (
                <button
                  key={r.value}
                  onClick={() => { setRole(r.value); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold flex items-center gap-1.5 ${
                    role === r.value
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-secondary text-secondary border-theme hover:text-primary'
                  }`}
                >
                  {r.icon && <r.icon className="w-3.5 h-3.5" />}
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono rounded-xl">
            ✕ {error}
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-xl">
            ✓ {successMsg}
          </div>
        )}

        {/* Search & Status Filters */}
        <div className="bg-card-bg border border-theme p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user by name or email address..."
                className="w-full pl-9 pr-3 py-2 border border-theme bg-secondary text-primary rounded-lg font-mono text-xs focus:outline-none focus:border-red-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white font-mono text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto font-mono text-xs">
            <SlidersHorizontal className="w-4 h-4 text-secondary" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="py-2 px-3 border border-theme bg-secondary text-primary rounded-lg focus:outline-none focus:border-red-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="inactive">Inactive Accounts</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card-bg border border-theme rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-mono text-secondary">Fetching user list from database...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-secondary font-mono text-xs space-y-2">
              <p>No user accounts matched the current filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="bg-secondary/40 border-b border-theme text-[10px] text-secondary uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">User Details</th>
                    <th className="py-3 px-4 font-semibold">Role</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Created At</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-primary">{u.name}</div>
                        <div className="text-[11px] text-secondary">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          u.role === 'recruiter' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          u.role === 'tpo' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {u.is_active !== false ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 text-[10px] font-bold bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-secondary text-[11px]">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Link
                          to={`/admin/users/${u.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 border border-theme bg-secondary hover:text-primary text-secondary rounded font-mono text-[10px] font-bold"
                        >
                          <Eye className="w-3 h-3" /> View
                        </Link>

                        <button
                          onClick={() => handleToggleStatus(u.id, u.is_active !== false)}
                          disabled={actionLoading === u.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-mono text-[10px] font-bold border transition-colors ${
                            u.is_active !== false
                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {actionLoading === u.id ? (
                            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          ) : u.is_active !== false ? (
                            <><UserX className="w-3 h-3" /> Deactivate</>
                          ) : (
                            <><UserCheck className="w-3 h-3" /> Activate</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-theme flex items-center justify-between font-mono text-xs text-secondary">
              <div>Page {page} of {totalPages} ({total} items)</div>
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
