import React from 'react';
import { Menu, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function StudentHeader({ title, subtitle, onMenuToggle, showSidebarToggle = true }) {
  const { user, studentProfile } = useAuth();

  const displayName = studentProfile?.full_name || user?.name || 'Student';

  return (
    <header className="h-[76px] bg-card-bg border-b border-theme sticky top-0 z-20 px-6 flex items-center">
      <div className="flex items-center justify-between w-full gap-4 max-w-7xl mx-auto">
        
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

        {/* Right Side: Profile Status & Avatar */}
        <div className="flex items-center gap-3">
          {studentProfile && (
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono font-medium ${
              studentProfile.profile_completed 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}>
              {studentProfile.profile_completed && <Sparkles className="w-3.5 h-3.5" />}
              Profile {Math.round(studentProfile.profile_completion || 0)}%
            </div>
          )}

          <div className="h-9 w-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 font-bold text-sm cursor-pointer hover:bg-indigo-500/20 transition-colors" title={displayName}>
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>

      </div>
    </header>
  );
}
