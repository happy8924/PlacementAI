import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { User, ShieldCheck, Key, Lock, Mail } from 'lucide-react';

export default function AdminProfilePage() {
  const { user } = useAuth();

  return (
    <AdminLayout title="Admin Account Profile">
      <div className="space-y-6 font-mono text-xs">
        
        {/* Header */}
        <div className="bg-card-bg border border-theme p-6 rounded-2xl space-y-1">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-extrabold text-primary uppercase tracking-tight">
              Root Administrator Profile
            </h2>
          </div>
          <p className="text-xs text-secondary">
            System governance privileges, authenticated session details, and security configuration.
          </p>
        </div>

        {/* Profile Details Card */}
        <div className="bg-card-bg border border-theme rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-4 border-b border-theme pb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xl shadow-lg shadow-red-500/20">
              {(user?.name || 'Admin').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-primary">{user?.name || 'Administrator'}</h3>
              <p className="text-secondary">{user?.email || 'admin@placement.ai'}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold uppercase rounded">
                System Superuser
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-primary uppercase tracking-wider text-xs">Security Credentials</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-secondary">
              <div className="p-4 bg-secondary/40 border border-theme rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-secondary">Account ID</span>
                <p className="font-bold text-primary">{user?.id}</p>
              </div>
              <div className="p-4 bg-secondary/40 border border-theme rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-secondary">Role Claim</span>
                <p className="font-bold text-emerald-400 uppercase">{user?.role}</p>
              </div>
              <div className="p-4 bg-secondary/40 border border-theme rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-secondary">Authentication Protocol</span>
                <p className="font-bold text-primary">Signed JWT (HS256)</p>
              </div>
              <div className="p-4 bg-secondary/40 border border-theme rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-secondary">Session Protection</span>
                <p className="font-bold text-emerald-400">Server RBAC Enforced</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
