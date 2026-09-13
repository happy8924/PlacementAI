import { sendOtp, verifyOtp } from '../services/auth';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, BookOpen, Calendar, Hash, ArrowLeft } from 'lucide-react';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP state
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState(null);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  
  // Student specific details
  const [rollNumber, setRollNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('2026');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check OTP verification first
    if (!otpToken) {
      setError('Please verify your email address with OTP before registering.');
      return;
    }

    // Pre-flight validations
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all standard registration fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    const payload = {
      name,
      email,
      password,
      role,
    };

    // If role is student, add details
    if (role === 'student') {
      if (!rollNumber || !branch || !graduationYear) {
        setError('Please complete all student profile initialization fields.');
        return;
      }
      payload.student_details = {
        roll_number: rollNumber,
        branch,
        graduation_year: parseInt(graduationYear, 10),
      };
    }

    setLoading(true);
    try {
      const data = await signup(payload, otpToken);
      if (data.success) {
        setSuccess('Registration successful! Redirecting to login page...');
        setOtp('');
        setOtpToken(null);
        setOtpSent(false);

        setTimeout(() => {
          navigate('/login?registered=true');
        }, 2000);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      const detailMsg = err.response?.data?.detail || 'Registration failed. Please check inputs and try again.';
      setError(detailMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setOtpError('');
    setOtpSuccess('');

    if (!email) { 
      setOtpError('Please enter your email address first.'); 
      return; 
    }
    setOtpLoading(true);
    try {
      const data = await sendOtp(email);
      if (data.success) {
        setOtpSent(true);
        setOtpSuccess(data.message || 'OTP sent successfully to your email address.');
      } else {
        setOtpError(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      console.error('Send OTP failed:', err);
      const detailMsg = err.response?.data?.detail || 'Failed to send OTP. Please check email address and try again.';
      setOtpError(detailMsg);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError('');
    setOtpSuccess('');

    if (!otp) { 
      setOtpError('Please enter the 6-digit OTP code.'); 
      return; 
    }
    setOtpLoading(true);
    try {
      const data = await verifyOtp(email, otp);
      if (data.success) {
        setOtpToken(data.registration_token);
        setOtpSent(false);
        setOtpSuccess('Email verified successfully!');
      } else {
        setOtpError(data.message || 'OTP verification failed.');
      }
    } catch (err) {
      console.error('Verify OTP failed:', err);
      const detailMsg = err.response?.data?.detail || 'Invalid OTP. Please check the code and try again.';
      setOtpError(detailMsg);
    } finally {
      setOtpLoading(false);
    }
  };  

  return (
    <div className="min-h-screen bg-primary flex flex-col justify-center relative overflow-hidden px-6 py-12">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-grid-theme opacity-20 pointer-events-none"></div>

      {/* Floating Back to Home button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary hover:text-primary transition-colors font-mono"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="max-w-lg w-full mx-auto relative z-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold items-center justify-center rounded-2xl shadow-md mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">Create Account</h2>
          <p className="text-xs text-secondary font-mono uppercase tracking-widest">// Register to initialize your profile space</p>
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
            
            {/* Split row for Name and Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-primary uppercase font-bold text-[10px] font-mono tracking-wider">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aaryan Shah"
                    className="w-full pl-10 pr-3 py-3 border border-theme bg-secondary text-primary rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Profile Role */}
              <div className="space-y-1">
                <label className="block text-primary uppercase font-bold text-[10px] font-mono tracking-wider">Profile Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-3 border border-theme bg-secondary text-primary rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="student">Student / Job Seeker</option>
                  <option value="recruiter">Recruiter / Hiring Partner</option>
                  <option value="tpo">Placement Officer (TPO)</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>

            </div>

            {/* Email Address & OTP Section */}
            <div className="space-y-2">
              <label className="block text-primary uppercase font-bold text-[10px] font-mono tracking-wider">
                Email Address
              </label>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (otpToken) setOtpToken(null);
                    }}
                    placeholder="name@university.edu"
                    className="w-full pl-10 pr-3 py-3 border border-theme bg-secondary text-primary rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                    disabled={!!otpToken}
                  />
                </div>

                {/* Send / Resend OTP Button */}
                {!otpToken && (
                  <button
                    type="button" onClick={handleSendOtp} disabled={otpLoading || !email}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold rounded-lg transition-all disabled:opacity-50 whitespace-nowrap flex items-center gap-1 shadow-sm"
                  >
                    {otpLoading && !otpSent ? (
                      <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : null}
                    {otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                )}
              </div>

              {/* Verified Badge */}
              {otpToken && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded-lg flex items-center justify-between">
                  <span>✓ Email Verified Successfully</span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpToken(null);
                      setOtpSent(false);
                      setOtp('');
                    }}
                    className="text-[10px] underline text-emerald-300 hover:text-emerald-100 ml-2"
                  >
                    Change Email
                  </button>
                </div>
              )}

              {/* OTP Entry Box */}
              {otpSent && !otpToken && (
                <div className="p-3 bg-secondary/80 border border-blue-500/30 rounded-xl space-y-3 mt-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                    // Enter 6-Digit Verification Code
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="e.g. 123456"
                      className="flex-1 px-3 py-2.5 border border-theme bg-primary text-primary rounded-lg focus:outline-none focus:border-blue-500 font-mono text-xs text-center tracking-widest font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpLoading || otp.length !== 6}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold rounded-lg transition-all disabled:opacity-50 whitespace-nowrap flex items-center gap-1"
                    >
                      {otpLoading ? (
                        <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      ) : null}
                      Verify OTP
                    </button>
                  </div>
                </div>
              )}

              {/* OTP Feedback Messages */}
              {otpSuccess && !otpToken && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-lg">
                  ✓ {otpSuccess}
                </div>
              )}
              {otpError && (
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-lg">
                  ✕ {otpError}
                </div>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Password */}
              <div className="space-y-1">
                <label className="block text-primary uppercase font-bold text-[10px] font-mono tracking-wider">Password</label>
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

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-primary uppercase font-bold text-[10px] font-mono tracking-wider">Confirm Password</label>
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

            </div>

            {/* Student Specific Fields */}
            {role === 'student' && (
              <div className="p-4 bg-secondary border border-theme rounded-xl space-y-4 pt-3 mt-4">
                <div className="font-mono text-[9px] uppercase tracking-wider text-teal-500 font-bold border-b border-theme pb-1">
                  // Student Context Initialization
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Roll Number / USN */}
                  <div className="space-y-1 sm:col-span-1">
                    <label className="block text-primary uppercase font-bold text-[9px] font-mono tracking-wider">USN / Roll No.</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                        <Hash className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        placeholder="e.g. 1CS22CS001"
                        className="w-full pl-9 pr-2 py-2.5 border border-theme bg-primary text-primary rounded-lg focus:outline-none focus:border-blue-500 font-mono text-[11px] focus:ring-2 focus:ring-blue-500/20 transition-all"
                        required={role === 'student'}
                      />
                    </div>
                  </div>

                  {/* Branch */}
                  <div className="space-y-1 sm:col-span-1">
                    <label className="block text-primary uppercase font-bold text-[9px] font-mono tracking-wider">Branch</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        placeholder="e.g. Computer Science"
                        className="w-full pl-9 pr-2 py-2.5 border border-theme bg-primary text-primary rounded-lg focus:outline-none focus:border-blue-500 font-mono text-[11px] focus:ring-2 focus:ring-blue-500/20 transition-all"
                        required={role === 'student'}
                      />
                    </div>
                  </div>

                  {/* Graduation Year */}
                  <div className="space-y-1 sm:col-span-1">
                    <label className="block text-primary uppercase font-bold text-[9px] font-mono tracking-wider">Graduation Year</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="number"
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        placeholder="2026"
                        className="w-full pl-9 pr-2 py-2.5 border border-theme bg-primary text-primary rounded-lg focus:outline-none focus:border-blue-500 font-mono text-[11px] focus:ring-2 focus:ring-blue-500/20 transition-all"
                        min="2000"
                        max="2100"
                        required={role === 'student'}
                      />
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !otpToken}
              className="w-full py-4 mt-6 btn-brand-primary font-bold font-mono text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Initializing Environment...
                </>
              ) : (
                <>
                  Create Account Space
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
            {!otpToken && (
              <p className="text-[11px] text-center text-secondary font-mono">
                * Send & Verify Email OTP to enable account creation.
              </p>
            )}

          </form>
        </div>

        {/* Footer Prompt */}
        <p className="text-center text-xs text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 font-bold hover:underline font-mono">
            Login Here
          </Link>
        </p>

      </div>
    </div>
  );
}
