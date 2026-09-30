import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getSystemSettings, updateSystemSettings } from '../../services/admin';
import { Sliders, Save, CheckCircle2, ShieldAlert, Cpu, Lock, Bell } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    allow_student_registration: true,
    allow_recruiter_registration: true,
    ai_engine_active: true,
    maintenance_mode: false,
    system_announcement: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSystemSettings();
      if (res.success && res.settings) {
        setSettings(prev => ({ ...prev, ...res.settings }));
      }
    } catch (err) {
      console.error('Error fetching system settings:', err);
      setError('Failed to load system configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await updateSystemSettings(settings);
      if (res.success) {
        setSuccess('System settings updated successfully.');
      }
    } catch (err) {
      console.error('Error updating system settings:', err);
      setError(err.response?.data?.detail || 'Failed to save system settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Platform Settings">
      <div className="space-y-6 font-mono">
        
        {/* Header */}
        <div className="bg-card-bg border border-theme p-6 rounded-2xl space-y-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-extrabold text-primary uppercase tracking-tight">
              Platform Configuration & Toggles
            </h2>
          </div>
          <p className="text-xs text-secondary">
            Manage global platform behaviors, AI service toggles, user registration gates, and maintenance announcements.
          </p>
        </div>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl">✕ {error}</div>}
        {success && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">✓ {success}</div>}

        {loading ? (
          <div className="p-12 text-center text-xs text-secondary">
            <div className="w-8 h-8 border-3 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto mb-2"></div>
            Loading settings configuration...
          </div>
        ) : (
          <form onSubmit={handleSave} className="bg-card-bg border border-theme rounded-2xl p-6 space-y-6 text-xs">
            
            {/* Registration Toggles */}
            <div className="space-y-4 border-b border-theme pb-6">
              <h3 className="text-sm font-extrabold text-primary uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-400" /> Registration Gates
              </h3>

              <div className="flex items-center justify-between p-3.5 bg-secondary/40 border border-theme rounded-xl">
                <div>
                  <div className="font-bold text-primary">Student Registration</div>
                  <div className="text-[11px] text-secondary">Allow new candidate self-registrations via OTP</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allow_student_registration}
                  onChange={(e) => setSettings({ ...settings, allow_student_registration: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded border-theme focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-secondary/40 border border-theme rounded-xl">
                <div>
                  <div className="font-bold text-primary">Recruiter Registration</div>
                  <div className="text-[11px] text-secondary">Allow corporate recruiter onboarding</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allow_recruiter_registration}
                  onChange={(e) => setSettings({ ...settings, allow_recruiter_registration: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded border-theme focus:ring-red-500"
                />
              </div>
            </div>

            {/* AI & Infrastructure Toggles */}
            <div className="space-y-4 border-b border-theme pb-6">
              <h3 className="text-sm font-extrabold text-primary uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" /> AI & System State
              </h3>

              <div className="flex items-center justify-between p-3.5 bg-secondary/40 border border-theme rounded-xl">
                <div>
                  <div className="font-bold text-primary">Gemini AI Engine Service</div>
                  <div className="text-[11px] text-secondary">Enable AI resume parsing and roadmap generation</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.ai_engine_active}
                  onChange={(e) => setSettings({ ...settings, ai_engine_active: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded border-theme focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-secondary/40 border border-theme rounded-xl">
                <div>
                  <div className="font-bold text-primary">Maintenance Mode</div>
                  <div className="text-[11px] text-secondary">Display maintenance banner to non-admin users</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded border-theme focus:ring-red-500"
                />
              </div>
            </div>

            {/* Announcement Banner */}
            <div className="space-y-2">
              <label className="font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" /> Platform Announcement Banner
              </label>
              <input
                type="text"
                value={settings.system_announcement || ''}
                onChange={(e) => setSettings({ ...settings, system_announcement: e.target.value })}
                placeholder="Broadcast notification text for logged-in workspace headers..."
                className="w-full p-3 border border-theme bg-secondary text-primary rounded-xl font-mono text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-red-600/20"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save System Settings'}
            </button>

          </form>
        )}

      </div>
    </AdminLayout>
  );
}
