import React from 'react';
import { Menu, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function StudentHeader({ title, subtitle, onMenuToggle, showSidebarToggle = true }) {
  const { user, studentProfile, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = studentProfile?.full_name || user?.name || 'Student';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-card-bg border-b border-theme sticky top-0 z-20 px-6 py-4">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        
        {/* Left Side: Mobile Menu Button & Page Title */}
        <div className="flex items-center gap-4">
          {showSidebarToggle && onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 rounded-xl border border-theme bg-secondary text-primary hover:bg-theme transition-colors"
              aria-label="Open sidebar navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <h1 className="text-xl font-extrabold text-primary tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-xs text-secondary font-mono mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right Side: Student Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-primary truncate">{displayName}</span>
            <span className="text-[10px] text-secondary font-mono truncate">{user?.email}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-theme bg-secondary text-secondary hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all text-xs font-mono font-bold uppercase tracking-wider"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
}
