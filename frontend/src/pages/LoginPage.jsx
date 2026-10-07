import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getStudentProfile } from '../services/student';
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [appId, setAppId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if redirect path is saved, else default based on role
  const fromPath = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!appId || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(appId, password);
      if (data.success) {
        // Successful login - determine redirect target
        if (fromPath) {
          navigate(fromPath, { replace: true });
        } else {
          // Redirect based on role
          const role = data.user.role;
          if (role === 'student') {
            try {
              const profData = await getStudentProfile();
              const p = profData?.profile;
              const isComp = p && (p.profile_completed || (p.full_name && p.branch && p.graduation_year && p.cgpa && p.skills?.length > 0 && (p.links?.github || p.links?.linkedin)));
              if (isComp) {
                navigate('/student/dashboard', { replace: true });
              } else {
                navigate('/student/resume', { replace: true });
              }
            } catch {
              navigate('/student/dashboard', { replace: true });
            }
          }
          else if (role === 'recruiter') navigate('/recruiter/dashboard');
          else if (role === 'tpo') navigate('/tpo/dashboard');
          else if (role === 'admin') navigate('/admin/dashboard');
          else navigate('/');
        }
      }
    } catch (err) {
      console.error('Login error details:', err);
      const detailMsg = err.response?.data?.detail || 'Invalid ID or password. Please try again.';
      setError(detailMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col justify-center relative overflow-hidden px-6 py-12">
      {/* Grid Background Overlay */}
      <div className="absolute inset-0 bg-grid-theme opacity-20 pointer-events-none"></div>

      {/* Floating Back to Home button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary hover:text-primary transition-colors font-mono"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="max-w-md w-full mx-auto relative z-10 space-y-8">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold items-center justify-center rounded-2xl shadow-md mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">Welcome Back</h2>
          <p className="text-xs text-secondary font-mono uppercase tracking-widest">// Log in to your placement intelligence workspace</p>
        </div>

        {/* Card Form */}
        <div className="bg-card-bg border border-theme p-8 rounded-2xl shadow-2xl space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono rounded-lg">
              ✕ {error}
            </div>
          )}

          {location.search.includes('expired=true') && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-mono rounded-lg">
              ⚠ Session expired. Please log in again.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* ID/Email Input */}
            <div className="space-y-1">
              <label className="block text-primary uppercase font-bold text-[10px] font-mono tracking-wider">PlacementAI ID or Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="e.g. PLS0001 or email"
                  className="w-full pl-10 pr-3 py-3 border border-theme bg-secondary text-primary rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-primary uppercase font-bold text-[10px] font-mono tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-[10px] font-bold text-blue-500 hover:underline uppercase font-mono tracking-wider">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-theme bg-secondary text-primary rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-6 btn-brand-primary font-bold font-mono text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                <>
                  Authenticate Workspace
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Footer Signup Prompt */}
        <p className="text-center text-xs text-secondary">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-500 font-bold hover:underline font-mono">
            Register Here
          </Link>
        </p>

      </div>
    </div>
  );
}
