import React, { useState, useEffect, useRef } from 'react';
import { Menu, Moon, Sun, Bell, Inbox, Check, Settings, LogOut, User, Monitor } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { getStudentNotifications, markNotificationRead } from '../../services/student';

export default function StudentHeader({ title, subtitle, onMenuToggle, showSidebarToggle = true }) {
  const { user, studentProfile, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = studentProfile?.full_name || user?.name || 'Student';
  const displayEmail = user?.email || 'student@university.edu';
  const avatarUrl = studentProfile?.profile_photo || null;

  // --- Theme State ---
  const [themePref, setThemePref] = useState(() => {
    return localStorage.getItem('themePreference') || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem('themePreference', themePref);
    
    const applyDark = themePref === 'dark' || (themePref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (applyDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark'); // Backward compatibility
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [themePref]);

  // --- Notifications State ---
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // --- Dropdown States ---
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await getStudentNotifications();
        if (res.success) {
          setNotifications(res.notifications || []);
          setUnreadCount(res.unread_count || 0);
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };
    fetchNotifs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 60) return `${diffMins || 1}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${diffDays}d ago`;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-[76px] bg-card-bg border-b border-theme sticky top-0 z-20 px-6 flex items-center">
      <div className="flex items-center justify-between w-full gap-4 max-w-7xl mx-auto relative">

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
              <p className="text-xs text-secondary font-mono mt-0.5 hidden sm:block">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right Side: Tools & Profile */}
        <div className="flex items-center gap-3 relative">
          
          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2.5 rounded-full border border-theme text-secondary hover:bg-secondary/10 hover:text-primary transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-3 w-80 bg-card-bg border border-theme rounded-2xl shadow-xl overflow-hidden z-50">
                <div className="p-3 border-b border-theme bg-secondary/5 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-primary">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center">
                      <Inbox className="w-8 h-8 text-secondary/50 mb-2" />
                      <p className="text-xs text-secondary">No notifications yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-theme">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-3 hover:bg-secondary/5 transition-colors flex gap-3 ${!n.is_read ? 'bg-indigo-500/5' : ''}`}>
                          <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${!n.is_read ? 'bg-indigo-500' : 'bg-transparent'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs ${!n.is_read ? 'font-bold text-primary' : 'font-medium text-secondary'}`}>
                              {n.action === 'applied_to_job' ? `You applied to ${n.details?.job_title}` : n.action}
                            </p>
                            <p className="text-[10px] text-secondary mt-1">{formatTime(n.timestamp)}</p>
                          </div>
                          {!n.is_read && (
                            <button onClick={(e) => handleMarkRead(n.id, e)} className="p-1 text-secondary hover:text-indigo-600 hover:bg-indigo-500/10 rounded-md transition-colors" title="Mark as read">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Link 
                  to="/student/notifications" 
                  onClick={() => setShowNotifDropdown(false)} 
                  className="block p-2 text-center text-xs font-bold text-indigo-500 bg-secondary/5 hover:bg-indigo-500/10 transition-colors"
                >
                  View All Notifications
                </Link>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-theme mx-1"></div>

          {/* Profile Menu Trigger */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="relative flex items-center justify-center h-10 w-10 rounded-full border border-theme bg-indigo-500/10 text-indigo-500 font-bold text-sm overflow-hidden hover:ring-2 hover:ring-indigo-500/50 transition-all shadow-sm"
              title={displayName}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute top-12 right-0 mt-2 w-80 bg-card-bg border border-theme rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col">
                
                {/* Header Profile Info */}
                <div className="p-4 border-b border-theme flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border border-theme bg-indigo-500/10 text-indigo-500 font-bold text-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-primary truncate">{displayName}</h3>
                    <p className="text-xs text-secondary truncate">{displayEmail}</p>
                  </div>
                </div>

                {/* Action Links */}
                <div className="p-2 space-y-1 border-b border-theme">
                  <Link
                    to="/student/profile"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/10 text-primary transition-colors"
                  >
                    <User className="w-4 h-4 text-blue-500" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">My Profile</p>
                      <p className="text-[10px] text-secondary">Academic details, skills, links</p>
                    </div>
                  </Link>

                  <Link
                    to="/student/settings"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/10 text-primary transition-colors"
                  >
                    <Settings className="w-4 h-4 text-purple-500" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">Account Settings</p>
                      <p className="text-[10px] text-secondary">Security & preferences</p>
                    </div>
                  </Link>
                </div>

                {/* Theme Selection */}
                <div className="p-3 border-b border-theme">
                  <p className="text-[10px] font-bold text-secondary mb-2 px-1 uppercase tracking-wider">Appearance</p>
                  <div className="flex bg-secondary/20 rounded-xl p-1 gap-1">
                    <button
                      onClick={() => setThemePref('light')}
                      className={`flex-1 flex justify-center items-center gap-1.5 py-1.5 text-xs rounded-lg transition-colors ${themePref === 'light' ? 'bg-card-bg shadow-sm text-primary font-bold border border-theme' : 'text-secondary hover:text-primary'}`}
                    >
                      <Sun className="w-3.5 h-3.5" /> Light
                    </button>
                    <button
                      onClick={() => setThemePref('dark')}
                      className={`flex-1 flex justify-center items-center gap-1.5 py-1.5 text-xs rounded-lg transition-colors ${themePref === 'dark' ? 'bg-card-bg shadow-sm text-primary font-bold border border-theme' : 'text-secondary hover:text-primary'}`}
                    >
                      <Moon className="w-3.5 h-3.5" /> Dark
                    </button>
                    <button
                      onClick={() => setThemePref('system')}
                      className={`flex-1 flex justify-center items-center gap-1.5 py-1.5 text-xs rounded-lg transition-colors ${themePref === 'system' ? 'bg-card-bg shadow-sm text-primary font-bold border border-theme' : 'text-secondary hover:text-primary'}`}
                    >
                      <Monitor className="w-3.5 h-3.5" /> Auto
                    </button>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-bold">Log Out</span>
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </header>
  );
}
