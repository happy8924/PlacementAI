import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  Building,
  ShieldCheck,
  Briefcase,
  Cpu,
  Activity,
  FileCheck2,
  BarChart3,
  Sliders,
  User,
  LogOut,
  Sparkles,
  X
} from 'lucide-react';

export default function AdminSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'All Users', path: '/admin/users', icon: Users },
    { name: 'Students', path: '/admin/students', icon: GraduationCap },
    { name: 'Recruiters', path: '/admin/recruiters', icon: Building2 },
    { name: 'TPO / Colleges', path: '/admin/tpos', icon: Building },
    { name: 'Roles & RBAC', path: '/admin/roles', icon: ShieldCheck },
  ];

  const monitoringNavItems = [
    { name: 'Placement Drives', path: '/admin/placement', icon: Briefcase },
    { name: 'AI Center', path: '/admin/ai-center', icon: Cpu },
    { name: 'System Health', path: '/admin/system', icon: Activity },
    { name: 'Audit Logs', path: '/admin/audit', icon: FileCheck2 },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'System Settings', path: '/admin/settings', icon: Sliders },
    { name: 'My Profile', path: '/admin/profile', icon: User },
  ];

  const displayName = user?.name || 'Administrator';
  const displayEmail = user?.email || 'admin@placement.ai';
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
        <NavLink to="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-primary tracking-tight block font-mono">
              Placement<span className="text-red-500">AI</span>
            </span>
            <span className="text-[10px] font-mono font-semibold text-red-400 uppercase tracking-widest block">
              Admin Governance
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
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        
        {/* Core Section */}
        <div className="space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-secondary">
            User Governance
          </div>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs tracking-wide transition-all ${
                    isActive
                      ? 'bg-red-600 text-white font-semibold shadow-md shadow-red-600/20'
                      : 'text-secondary hover:text-primary hover:bg-secondary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-secondary'}`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* System & Analytics Section */}
        <div className="space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-secondary">
            Monitoring & System
          </div>
          {monitoringNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs tracking-wide transition-all ${
                    isActive
                      ? 'bg-red-600 text-white font-semibold shadow-md shadow-red-600/20'
                      : 'text-secondary hover:text-primary hover:bg-secondary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-secondary'}`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-theme bg-secondary/50 space-y-3">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm font-mono">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-primary truncate">{displayName}</p>
            <p className="text-[10px] text-secondary font-mono truncate">{displayEmail}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-theme bg-card-bg text-secondary hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all text-xs font-mono font-bold uppercase tracking-wider"
        >
          <LogOut className="w-3.5 h-3.5" />
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
