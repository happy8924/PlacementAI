import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import { User, Lock, Bell, Moon, Sun, Shield, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { updateStudentProfile } from '../../services/student';
import { changePassword } from '../../services/auth';

export default function StudentSettingsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, studentProfile, fetchStudentProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // --- Profile State ---
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    college: '',
    degree: '',
    branch: '',
    graduation_year: '',
    github: '',
    linkedin: ''
  });

  // --- Security State ---
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // --- Preferences/Notifications State ---
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    interview_alerts: true,
    job_alerts: true,
    platform_updates: false,
    profile_visibility: 'public'
  });

  // --- Theme State ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (studentProfile) {
      setProfileData({
        full_name: studentProfile.full_name || user?.name || '',
        phone: studentProfile.phone || '',
        college: studentProfile.college || '',
        degree: studentProfile.degree || '',
        branch: studentProfile.branch || '',
        graduation_year: studentProfile.graduation_year || '',
        github: studentProfile.links?.github || '',
        linkedin: studentProfile.links?.linkedin || ''
      });
      if (studentProfile.preferences) {
        setPreferences(studentProfile.preferences);
      }
    }
  }, [studentProfile, user]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const trimText = (text) => text ? text.trim().replace(/\s{2,}/g, ' ') : '';
    const isValidUrl = (url) => !url || /^https?:\/\/.+/.test(url.trim());
    const isPhoneValid = !profileData.phone || /^\d{10}$/.test(profileData.phone.trim());

    if (!isPhoneValid) {
      showMessage('Mobile number must be exactly 10 digits.', 'error');
      setLoading(false);
      return;
    }

    if (profileData.github && !isValidUrl(profileData.github)) {
      showMessage('GitHub link must start with http:// or https://', 'error');
      setLoading(false);
      return;
    }

    if (profileData.linkedin && !isValidUrl(profileData.linkedin)) {
      showMessage('LinkedIn link must start with http:// or https://', 'error');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...studentProfile,
        full_name: trimText(profileData.full_name),
        phone: profileData.phone ? profileData.phone.trim() : null,
        college: trimText(profileData.college),
        degree: profileData.degree,
        branch: profileData.branch,
        graduation_year: profileData.graduation_year ? parseInt(profileData.graduation_year) : null,
        links: {
          ...studentProfile?.links,
          github: profileData.github ? profileData.github.trim() : null,
          linkedin: profileData.linkedin ? profileData.linkedin.trim() : null
        },
        preferences: preferences
      };
      
      await updateStudentProfile(payload);
      if (fetchStudentProfile) {
        await fetchStudentProfile();
      }
      showMessage('Profile updated successfully');
    } catch (err) {
      showMessage(err.response?.data?.detail || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('New passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      showMessage('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showMessage(err.response?.data?.detail || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...studentProfile,
        preferences: preferences
      };
      await updateStudentProfile(payload);
      await refreshProfile();
      showMessage('Preferences saved successfully');
    } catch (err) {
      showMessage(err.response?.data?.detail || 'Failed to save preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    const root = window.document.documentElement;
    if (newTheme) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Account & Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  const renderProfileTab = () => (
    <form onSubmit={handleProfileSave} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-primary">Full Name</label>
          <input type="text" value={profileData.full_name} onChange={e => setProfileData({...profileData, full_name: e.target.value})} className="w-full px-4 py-2.5 bg-dashboard-bg border border-theme rounded-xl text-primary focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-primary">Phone Number</label>
          <input type="tel" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full px-4 py-2.5 bg-dashboard-bg border border-theme rounded-xl text-primary focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-primary">College / University</label>
          <input type="text" value={profileData.college} onChange={e => setProfileData({...profileData, college: e.target.value})} className="w-full px-4 py-2.5 bg-dashboard-bg border border-theme rounded-xl text-primary focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-primary">Degree</label>
          <input type="text" value={profileData.degree} onChange={e => setProfileData({...profileData, degree: e.target.value})} className="w-full px-4 py-2.5 bg-dashboard-bg border border-theme rounded-xl text-primary focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-primary">Branch</label>
          <input type="text" value={profileData.branch} onChange={e => setProfileData({...profileData, branch: e.target.value})} className="w-full px-4 py-2.5 bg-dashboard-bg border border-theme rounded-xl text-primary focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-primary">Graduation Year</label>
          <input type="number" value={profileData.graduation_year} onChange={e => setProfileData({...profileData, graduation_year: e.target.value})} className="w-full px-4 py-2.5 bg-dashboard-bg border border-theme rounded-xl text-primary focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-primary">GitHub URL</label>
          <input type="url" value={profileData.github} onChange={e => setProfileData({...profileData, github: e.target.value})} className="w-full px-4 py-2.5 bg-dashboard-bg border border-theme rounded-xl text-primary focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-primary">LinkedIn URL</label>
          <input type="url" value={profileData.linkedin} onChange={e => setProfileData({...profileData, linkedin: e.target.value})} className="w-full px-4 py-2.5 bg-dashboard-bg border border-theme rounded-xl text-primary focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70">
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save Profile
        </button>
      </div>
    </form>
  );

  const renderSecurityTab = () => (
    <div className="space-y-8">
      <div className="bg-secondary/5 rounded-2xl p-6 border border-theme flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-primary text-lg">Email Address</h4>
          <p className="text-secondary text-sm mt-1">Your account is registered with this email.</p>
        </div>
        <div className="px-4 py-2 bg-dashboard-bg border border-theme rounded-xl font-mono text-sm text-primary">
          {user?.email}
        </div>
      </div>

      <form onSubmit={handlePasswordSave} className="space-y-6">
        <h4 className="font-bold text-primary text-lg border-b border-theme pb-2">Change Password</h4>
        <div className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-primary">Current Password</label>
            <input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} className="w-full px-4 py-2.5 bg-dashboard-bg border border-theme rounded-xl text-primary focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required minLength={8} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-primary">New Password</label>
            <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full px-4 py-2.5 bg-dashboard-bg border border-theme rounded-xl text-primary focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required minLength={8} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-primary">Confirm New Password</label>
            <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="w-full px-4 py-2.5 bg-dashboard-bg border border-theme rounded-xl text-primary focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required minLength={8} />
          </div>
        </div>
        <div className="pt-2">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
            Update Password
          </button>
        </div>
      </form>
    </div>
  );



  const renderNotificationsTab = () => (
    <form onSubmit={handlePreferencesSave} className="space-y-6">
      <h4 className="font-bold text-primary text-lg border-b border-theme pb-2">Notification Preferences</h4>
      <div className="space-y-4 max-w-xl">
        {[
          { key: 'email_notifications', title: 'Email Notifications', desc: 'Receive important updates and alerts via email.' },
          { key: 'interview_alerts', title: 'Interview Alerts', desc: 'Get notified about upcoming scheduled interviews.' },
          { key: 'job_alerts', title: 'Job Alerts', desc: 'Receive notifications for new jobs matching your profile.' },
          { key: 'platform_updates', title: 'Platform Updates', desc: 'Get updates about new features and announcements.' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between p-4 border border-theme rounded-xl bg-dashboard-bg">
            <div>
              <p className="font-bold text-primary">{item.title}</p>
              <p className="text-xs text-secondary mt-0.5">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={preferences[item.key]} 
                onChange={(e) => setPreferences({...preferences, [item.key]: e.target.checked})} 
              />
              <div className="w-11 h-6 bg-secondary/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        ))}
      </div>
      <div className="pt-4">
        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70">
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save Preferences
        </button>
      </div>
    </form>
  );

  const renderPrivacyTab = () => (
    <form onSubmit={handlePreferencesSave} className="space-y-6">
      <h4 className="font-bold text-primary text-lg border-b border-theme pb-2">Privacy Settings</h4>
      <div className="space-y-4 max-w-xl">
        <div className="flex items-center justify-between p-4 border border-theme rounded-xl bg-dashboard-bg">
          <div>
            <p className="font-bold text-primary">Profile Visibility</p>
            <p className="text-xs text-secondary mt-0.5">Control who can see your profile details.</p>
          </div>
          <select 
            value={preferences.profile_visibility}
            onChange={(e) => setPreferences({...preferences, profile_visibility: e.target.value})}
            className="px-3 py-2 bg-card-bg border border-theme rounded-lg text-sm text-primary focus:outline-none focus:border-indigo-500"
          >
            <option value="public">Public (Recruiters & Admins)</option>
            <option value="private">Private (Admins Only)</option>
          </select>
        </div>
      </div>
      <div className="pt-4">
        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70">
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save Privacy Settings
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      <StudentSidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentHeader
          title="Settings"
          subtitle="Manage your profile, preferences, and security"
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in ${
              message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
            }`}>
              {message.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              <span className="font-medium text-sm">{message.text}</span>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 flex-shrink-0 space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-secondary hover:bg-secondary/10 hover:text-primary'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-card-bg border border-theme rounded-2xl p-6 md:p-8 shadow-sm min-h-[500px]">
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'security' && renderSecurityTab()}
              {activeTab === 'notifications' && renderNotificationsTab()}
              {activeTab === 'privacy' && renderPrivacyTab()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
