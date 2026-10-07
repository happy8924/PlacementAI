import React, { useState, useEffect, useRef } from 'react';
import { Menu, Moon, Sun, LogOut, User, Building2, Monitor } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

export default function RecruiterHeader({ title, subtitle, onMenuToggle, showSidebarToggle = true }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.name || 'Recruiter';
  const displayEmail = user?.email || 'recruiter@company.com';

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
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [themePref]);

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="relative flex items-center justify-center h-10 w-10 rounded-full border border-theme bg-indigo-500/10 text-indigo-600 font-bold text-sm overflow-hidden hover:ring-2 hover:ring-indigo-500/50 transition-all shadow-sm"
              title={displayName}
            >
              {displayName.charAt(0).toUpperCase()}
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute top-12 right-0 mt-2 w-80 bg-card-bg border border-theme rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col">
                
                {/* Header Profile Info */}
                <div className="p-4 border-b border-theme flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full border border-theme bg-indigo-500/10 text-indigo-600 font-bold text-base flex items-center justify-center flex-shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-primary truncate">{displayName}</h3>
                    <p className="text-xs text-secondary truncate">{displayEmail}</p>
                    <span className="inline-block mt-1 text-[10px] font-mono uppercase font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">
                      Recruiter Partner
                    </span>
                  </div>
                </div>

                {/* Action Links */}
                <div className="p-2 space-y-1 border-b border-theme">
                  <Link
                    to="/recruiter/profile"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/10 text-primary transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-indigo-500" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">Company Profile</p>
                      <p className="text-[10px] text-secondary">Manage corporate & branding info</p>
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
