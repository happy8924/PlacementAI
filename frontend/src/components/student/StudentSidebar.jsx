import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  FileText,
  Compass,
  Mic,
  Briefcase,
  CheckSquare,
  Bookmark,
  Bell,
  User,
  Settings,
  LogOut,
  Sparkles,
  X
} from 'lucide-react';

export default function StudentSidebar({ isOpen, onClose }) {
  const { user, studentProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'AI Resume Analysis', path: '/student/resume', icon: FileText, badge: 'AI', badgeBg: 'bg-blue-500/10 text-blue-600' },
    { name: 'Skill Gap & Roadmap', path: '/student/roadmap', icon: Compass, badge: 'New', badgeBg: 'bg-indigo-500/10 text-indigo-600' },
    { name: 'Mock AI Interview', path: '/student/interview', icon: Mic },
    { name: 'Jobs & Opportunities', path: '/student/jobs', icon: Briefcase },
    { name: 'My Applications', path: '/student/applications', icon: CheckSquare },
    { name: 'Saved Bookmarks', path: '/student/bookmarks', icon: Bookmark },
    { name: 'Notifications', path: '/student/notifications', icon: Bell },
    { name: 'Profile & Portfolio', path: '/student/profile', icon: User },
    { name: 'Settings', path: '/student/settings', icon: Settings },
  ];

  const displayName = studentProfile?.full_name || user?.name || 'Student';
  const displayEmail = user?.email || 'student@university.edu';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card-bg border-r border-theme">
      {/* Branding Header */}
      <div className="p-6 border-b border-theme flex items-center justify-between">
        <NavLink to="/student/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-primary tracking-tight block">
              Placement<span className="text-blue-600">AI</span>
            </span>
            <span className="text-[10px] font-mono font-semibold text-secondary uppercase tracking-widest block">
              Student Workspace
            </span>
          </div>
        </NavLink>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg text-secondary hover:text-primary hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-secondary">
          Core Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-xs tracking-wide transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                    : 'text-secondary hover:text-primary hover:bg-secondary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-secondary'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeBg || 'bg-blue-500/10 text-blue-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-theme bg-secondary/50 space-y-3">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-primary truncate">{displayName}</p>
            <p className="text-[10px] text-secondary font-mono truncate">{displayEmail}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-theme bg-card-bg text-secondary hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all text-xs font-mono font-bold uppercase tracking-wider"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 flex-shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
