import React from 'react';
import StudentDashboard from '../../components/StudentDashboard';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function StudentDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-primary flex flex-col transition-colors duration-300">
      {/* Dashboard Top Header */}
      <header className="bg-navbar border-b border-theme sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center rounded-lg shadow">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span className="font-extrabold text-sm tracking-tight text-primary font-mono uppercase">
              Student Workspace
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {/* User display */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-secondary border border-theme rounded-lg font-mono text-[11px] text-secondary">
              <UserIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>{user?.name || 'Student'}</span>
            </div>

            {/* Logout CTA */}
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

      {/* Main Student Dashboard View */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6">
          <div className="px-6 mb-4">
            <h1 className="text-2xl font-bold text-primary font-sans">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs text-secondary font-mono">
              Logged in as: {user?.email} • Student ID: {user?.id}
            </p>
          </div>
          <StudentDashboard />
        </div>
      </main>
    </div>
  );
}
