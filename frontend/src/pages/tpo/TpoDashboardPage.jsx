import React from 'react';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';

export default function TpoDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-primary flex flex-col transition-colors duration-300">
      <header className="bg-navbar border-b border-theme sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center rounded-lg shadow">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-primary font-mono uppercase">
              TPO Controller
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-secondary border border-theme rounded-lg font-mono text-[11px] text-secondary">
              <UserIcon className="w-3.5 h-3.5 text-teal-500" />
              <span>{user?.name || 'TPO'}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-lg font-mono text-[11px] font-bold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>

        </div>
      </header>

      <main className="flex-grow p-6 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-grid-theme opacity-10 pointer-events-none"></div>
        
        <div className="max-w-2xl w-full text-center space-y-6 relative z-10 bg-card-bg p-10 border border-theme rounded-2xl shadow-xl">
          <div className="inline-block px-3 py-1 bg-teal-500/10 text-teal-500 border border-teal-500/20 font-mono text-[10px] uppercase font-bold rounded">
            Institutional Control: Active
          </div>
          <h2 className="text-3xl font-extrabold text-primary font-sans">Placement Officer Dashboard</h2>
          <p className="text-xs text-secondary font-mono leading-relaxed max-w-lg mx-auto">
            Welcome to the PlacementAI officer portal. Track campus-wide placement metrics, verify corporate job posts, and audit student statistics.
          </p>

          <div className="p-4 bg-secondary border border-theme rounded-xl text-left max-w-sm mx-auto font-mono text-xs text-secondary space-y-2">
            <div><span className="text-primary font-bold">Officer ID:</span> {user?.id}</div>
            <div><span className="text-primary font-bold">Authorized Account:</span> {user?.email}</div>
            <div><span className="text-primary font-bold">Platform Role:</span> {user?.role}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
