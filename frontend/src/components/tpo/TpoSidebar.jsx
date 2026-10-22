import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  BarChart3,
  FileCheck2,
  LogOut,
  Building2,
  X
} from 'lucide-react';

export default function TpoSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/tpo/dashboard', icon: LayoutDashboard },
    { name: 'Approvals Queue', path: '/tpo/approvals', icon: CheckCircle2 },
    { name: 'Student Directory', path: '/tpo/students', icon: GraduationCap },
    { name: 'Recruitment & Jobs', path: '/tpo/recruitment', icon: Briefcase },
    { name: 'Placement Analytics', path: '/tpo/analytics', icon: BarChart3 },
    { name: 'Audit Timeline', path: '/tpo/audit', icon: FileCheck2 },
  ];

  const displayName = user?.name || 'TPO Officer';
  const displayEmail = user?.email || 'tpo@placementai.edu';
  const appId = user?.app_id || 'TPO';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card-bg border-r border-theme">
      {/* Brand Header */}
      <div className="p-6 border-b border-theme flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo-icon.png"
            alt="PlacementAI"
            className="w-9 h-9 object-contain rounded-xl shadow-md shadow-indigo-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-primary tracking-tight font-sans">
                PlacementAI
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                TPO
              </span>
            </div>
            <p className="text-[10px] text-secondary font-mono tracking-wider uppercase">
              Officer Portal
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-secondary transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase font-bold text-secondary tracking-widest">
          Institutional Governance
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-secondary hover:text-primary hover:bg-secondary'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* TPO User Footer */}
      <div className="p-4 border-t border-theme">
        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary border border-theme">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-indigo-500/30">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-primary truncate">{displayName}</p>
              <p className="text-[10px] text-secondary font-mono truncate">{appId} • {displayEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-full shadow-2xl transition-transform">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
