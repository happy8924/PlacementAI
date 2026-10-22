import React, { useState, useEffect } from 'react';
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
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut
} from 'lucide-react';

export default function StudentSidebar({ isOpen, onClose }) {
  const { user, studentProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }, [isCollapsed]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = studentProfile?.full_name || user?.name || 'Student';
  const displayEmail = user?.email || 'student@university.edu';
  const avatarUrl = studentProfile?.profile_photo || null;
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'AI Resume Analysis', path: '/student/resume', icon: FileText, badge: 'AI', badgeBg: 'bg-blue-500/10 text-blue-600' },
    { name: 'Skill Gap & Roadmap', path: '/student/roadmap', icon: Compass, badge: 'New', badgeBg: 'bg-indigo-500/10 text-indigo-600' },
    { name: 'Mock AI Interview', path: '/student/interview', icon: Mic },
    { name: 'Jobs & Opportunities', path: '/student/jobs', icon: Briefcase },
    { name: 'My Applications', path: '/student/applications', icon: CheckSquare },
    { name: 'Saved Bookmarks', path: '/student/bookmarks', icon: Bookmark },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full w-full bg-card-bg border-r border-theme transition-all duration-300">
      {/* Branding Header */}
      <div className="h-[76px] px-4 border-b border-theme flex items-center justify-between">
        <NavLink 
          to="/student/dashboard" 
          className={`flex items-center gap-3 group ${isCollapsed ? 'md:mx-auto mx-0' : ''}`}
          title="PlacementAI Dashboard"
        >
          <img
            src="/logo-icon.png"
            alt="PlacementAI"
            className="w-10 h-10 flex-shrink-0 rounded-xl object-contain shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform"
          />
          <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'md:hidden block' : 'block'}`}>
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
            className="md:hidden p-2 rounded-lg text-secondary hover:text-primary hover:bg-secondary/50 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 space-y-1.5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className={`px-7 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-secondary transition-all ${isCollapsed ? 'md:hidden block' : 'block'}`}>
          Core Navigation
        </div>
        <div className="px-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => { if (onClose) onClose(); }}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-xl font-medium text-xs tracking-wide transition-all group ${
                    isCollapsed ? 'md:justify-center md:p-3 justify-between px-3.5 py-3' : 'justify-between px-3.5 py-3'
                  } ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                      : 'text-secondary hover:text-primary hover:bg-secondary/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3.5">
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-secondary group-hover:text-primary'}`} />
                      <span className={`whitespace-nowrap ${isCollapsed ? 'md:hidden block' : 'block'}`}>
                        {item.name}
                      </span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isCollapsed ? 'md:hidden block' : 'block'} ${
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
        </div>
      </nav>

      {/* Footer Profile & Collapse */}
      <div className="mt-auto border-t border-theme flex flex-col bg-secondary/5">
        
        {/* Collapse Button */}
        <button
          onClick={toggleCollapse}
          className={`flex items-center text-secondary hover:text-primary hover:bg-secondary/10 transition-colors ${
            isCollapsed ? 'justify-center p-4' : 'px-4 py-3 gap-3'
          }`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <PanelLeftClose className={`w-5 h-5 flex-shrink-0 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          <span className={`text-sm font-medium whitespace-nowrap transition-all ${isCollapsed ? 'md:hidden block' : 'block'}`}>
            Collapse
          </span>
        </button>

        {/* Profile Footer */}
        <div className={`p-4 border-t border-theme flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-3'}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-sm flex-shrink-0 overflow-hidden">
            {avatarUrl ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover"/> : initials}
          </div>
          
          <div className={`flex-1 min-w-0 transition-all ${isCollapsed ? 'md:hidden block' : 'block'}`}>
            <p className="text-sm font-bold text-primary truncate">{displayName}</p>
            <p className="text-[10px] text-secondary truncate">{displayEmail}</p>
          </div>

          <button
            onClick={handleLogout}
            className={`text-secondary hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors flex-shrink-0 ${isCollapsed ? 'md:hidden block' : 'block'}`}
            title="Log Out"
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
      <aside className={`hidden md:block h-screen sticky top-0 flex-shrink-0 z-30 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 bg-card-bg">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
