import React from 'react';
import ThemeToggle from '../ThemeToggle';
import { useAuth } from '../../hooks/useAuth';
import {
  ShieldAlert,
  LogOut,
  User as UserIcon,
  Menu,
  Activity,
  Sparkles
} from 'lucide-react';

export default function AdminHeader({ onMenuClick, title = "Admin Console" }) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-navbar border-b border-theme sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Mobile Menu & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg text-secondary hover:text-primary hover:bg-secondary transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-primary tracking-tight font-mono uppercase">
                {title}
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] text-secondary font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>System Status: Optimal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Health Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full font-mono text-[10px] font-semibold text-emerald-400">
            <Activity className="w-3 h-3" />
            <span>DB Online</span>
          </div>

          <ThemeToggle />

          {/* User Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-secondary border border-theme rounded-lg font-mono text-[11px] text-secondary">
            <UserIcon className="w-3.5 h-3.5 text-red-400" />
            <span className="font-bold text-primary truncate max-w-[120px]">{user?.name || 'Root Admin'}</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-mono text-[11px] font-bold transition-all shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
}
