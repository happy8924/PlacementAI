import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/auth';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please input your email address.');
      return;
    }

    setLoading(true);
    try {
      const data = await forgotPassword(email);
      if (data.success) {
        setSuccess(data.message || 'Check your project Terminal for the password reset link. If you register with this email, you will receive the link there.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      const detailMsg = err.response?.data?.detail || 'An error occurred. Please try again.';
      setError(detailMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col justify-center relative overflow-hidden px-6 py-12">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-grid-theme opacity-20 pointer-events-none"></div>

      {/* Floating Back to Login */}
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
            <LockIcon />
          </div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">Forgot Password</h2>
          <p className="text-xs text-secondary font-mono uppercase tracking-widest">// Recover your workspace access</p>
        </div>

        {/* Card Form */}
        <div className="bg-card-bg border border-theme p-8 rounded-2xl shadow-2xl space-y-6">
          
          <p className="text-xs text-secondary leading-relaxed font-mono">
            Input your account's email address. We will generate and dispatch a one-time cryptographic link to reset your security credentials.
          </p>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono rounded-lg">
              ✕ {error}
            </div>
          )}

          {success ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono rounded-lg space-y-3">
              <div>✓ Request Received</div>
              <p className="text-[10px] text-emerald-500/80 leading-normal">
                {success}
              </p>
              <div className="pt-2 border-t border-emerald-500/10">
                <Link to="/login" className="text-xs font-bold underline text-emerald-500">
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div className="space-y-1">
                <label className="block text-primary uppercase font-bold text-[10px] font-mono tracking-wider">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full pl-10 pr-3 py-3 border border-theme bg-secondary text-primary rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-6 btn-brand-primary font-bold font-mono text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Dispatch Reset Link
                    <Send className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                  </>
                )}
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
    </svg>
  );
}
