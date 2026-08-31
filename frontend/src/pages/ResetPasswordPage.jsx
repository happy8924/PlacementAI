import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../services/auth';
import { Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Extract token from search params on mount
  useEffect(() => {
    const t = searchParams.get('token');
    if (t) {
      setToken(t);
    } else {
      setError('Password reset token is missing. Please request a new link.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid request. Token is missing.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      const data = await resetPassword(token, newPassword);
      if (data.success) {
        setSuccess('Password changed successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      const detailMsg = err.response?.data?.detail || 'Failed to reset password. The link may have expired or is invalid.';
      setError(detailMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col justify-center relative overflow-hidden px-6 py-12">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-grid-theme opacity-20 pointer-events-none"></div>

      {/* Floating Back to Home button */}
      <Link 
        to="/login" 
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary hover:text-primary transition-colors font-mono"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </Link>

      <div className="max-w-md w-full mx-auto relative z-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold items-center justify-center rounded-2xl shadow-md mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">Reset Password</h2>
          <p className="text-xs text-secondary font-mono uppercase tracking-widest">// Establish new security credentials</p>
        </div>

        {/* Card Form */}
        <div className="bg-card-bg border border-theme p-8 rounded-2xl shadow-2xl space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono rounded-lg">
              ✕ {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono rounded-lg">
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* New Password */}
            <div className="space-y-1">
              <label className="block text-primary uppercase font-bold text-[10px] font-mono tracking-wider">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-theme bg-secondary text-primary rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                  disabled={!token}
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

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-primary uppercase font-bold text-[10px] font-mono tracking-wider">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-theme bg-secondary text-primary rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                  disabled={!token}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-primary"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-4 mt-6 btn-brand-primary font-bold font-mono text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Resetting Password...
                </>
              ) : (
                <>
                  Update Security Credentials
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
