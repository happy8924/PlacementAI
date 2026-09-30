import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getRolesPermissions } from '../../services/admin';
import { ShieldCheck, Users, Lock, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getRolesPermissions();
      if (res.success) {
        setRoles(res.roles);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Could not fetch roles from database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Roles & RBAC Governance">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-card-bg border border-theme p-6 rounded-2xl space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-extrabold text-primary font-mono uppercase tracking-tight">
              Role-Based Access Control (RBAC)
            </h2>
          </div>
          <p className="text-xs text-secondary font-mono">
            Platform permission mapping and security boundaries across candidate, recruiter, TPO, and root admin roles.
          </p>
        </div>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono rounded-xl">✕ {error}</div>}

        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-secondary">
            <div className="w-8 h-8 border-3 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto mb-2"></div>
            Loading role definitions...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            {roles.map((r) => (
              <div key={r.role} className="bg-card-bg border border-theme p-6 rounded-2xl space-y-4 shadow-sm hover:border-red-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                      r.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      r.role === 'recruiter' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                      r.role === 'tpo' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {r.role}
                    </span>
                    <h3 className="font-extrabold text-primary text-sm">{r.title}</h3>
                  </div>
                  <span className="text-[11px] font-bold text-secondary flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {r.user_count} Users
                  </span>
                </div>

                <p className="text-secondary text-xs leading-relaxed">{r.description}</p>

                <div className="space-y-2 border-t border-theme pt-3">
                  <span className="text-[10px] font-bold uppercase text-secondary tracking-wider block">Assigned Scope & Permissions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {r.permissions.map((p) => (
                      <span key={p} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary border border-theme rounded text-[10px] text-primary">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
