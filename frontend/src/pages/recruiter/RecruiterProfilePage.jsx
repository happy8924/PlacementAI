import React, { useState, useEffect } from 'react';
import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar';
import RecruiterHeader from '../../components/recruiter/RecruiterHeader';
import {
  Building2,
  Globe,
  ShieldCheck,
  MapPin,
  Users,
  Award,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { getRecruiterProfile, updateRecruiterProfile } from '../../services/recruiter';

export default function RecruiterProfilePage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    company_name: '',
    logo: '',
    about: '',
    website: '',
    corporate_registration_id: '',
    industry: 'Software / IT Services',
    company_size: '100-500',
    tier: 'Tier 1 Corporate',
    headquarters: 'Bangalore, Karnataka',
    locations: 'Bangalore, Hyderabad, Pune, Remote',
    verification_status: 'verified'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getRecruiterProfile();
        if (res.success && res.profile) {
          const p = res.profile;
          setFormData({
            company_name: p.company_name || '',
            logo: p.logo || '',
            about: p.about || '',
            website: p.website || '',
            corporate_registration_id: p.corporate_registration_id || '',
            industry: p.industry || 'Software / IT Services',
            company_size: p.company_size || '100-500',
            tier: p.tier || 'Tier 1 Corporate',
            headquarters: p.headquarters || 'Bangalore, India',
            locations: Array.isArray(p.locations) ? p.locations.join(', ') : (p.locations || ''),
            verification_status: p.verification_status || 'verified'
          });
        }
      } catch (err) {
        setNotification({ type: 'error', text: "Failed to load company profile." });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        locations: formData.locations.split(',').map(s => s.trim()).filter(Boolean)
      };

      const res = await updateRecruiterProfile(payload);
      if (res.success) {
        setNotification({ type: 'success', text: "Company profile updated successfully!" });
      }
    } catch (err) {
      setNotification({ type: 'error', text: err.response?.data?.detail || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      <RecruiterSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <RecruiterHeader
          title="Company Corporate Profile"
          subtitle="Manage organizational details, corporate accreditation, and hiring brand info"
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-10 max-w-4xl w-full mx-auto space-y-6">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="mt-4 text-secondary text-sm">Loading company profile...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Header Verification Badge */}
              <div className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
                    {formData.logo ? (
                      <img src={formData.logo} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      (formData.company_name || 'C').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-primary">{formData.company_name || 'Company Name'}</h2>
                    <p className="text-xs text-secondary font-mono">{formData.industry} • {formData.company_size} Employees</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-mono font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>TPO Verification: {formData.verification_status.toUpperCase()}</span>
                </div>
              </div>

              {/* Toast Notification */}
              {notification && (
                <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                  <div className="flex items-center gap-2">
                    {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{notification.text}</span>
                  </div>
                </div>
              )}

              {/* Corporate Fields */}
              <div className="bg-card-bg border border-theme rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  General & Corporate Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3.5 py-2.5 border border-theme rounded-xl bg-secondary/30 text-primary text-xs focus:ring-2 focus:ring-indigo-500"
                      value={formData.company_name}
                      onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">Company Website</label>
                    <input
                      type="url"
                      className="w-full px-3.5 py-2.5 border border-theme rounded-xl bg-secondary/30 text-primary text-xs focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://company.com"
                      value={formData.website}
                      onChange={e => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">Industry</label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2.5 border border-theme rounded-xl bg-secondary/30 text-primary text-xs"
                      value={formData.industry}
                      onChange={e => setFormData({ ...formData, industry: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">Company Size</label>
                    <select
                      className="w-full px-3.5 py-2.5 border border-theme rounded-xl bg-secondary/30 text-primary text-xs"
                      value={formData.company_size}
                      onChange={e => setFormData({ ...formData, company_size: e.target.value })}
                    >
                      <option value="1-50">1-50 Employees</option>
                      <option value="50-200">50-200 Employees</option>
                      <option value="200-1000">200-1000 Employees</option>
                      <option value="1000+">1000+ Enterprise</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">Corporate Registration ID / CIN</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 border border-theme rounded-xl bg-secondary/30 text-primary text-xs font-mono"
                    placeholder="CIN / Registration Number"
                    value={formData.corporate_registration_id}
                    onChange={e => setFormData({ ...formData, corporate_registration_id: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">Headquarters Location</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 border border-theme rounded-xl bg-secondary/30 text-primary text-xs"
                    value={formData.headquarters}
                    onChange={e => setFormData({ ...formData, headquarters: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">Office Locations (Comma separated)</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 border border-theme rounded-xl bg-secondary/30 text-primary text-xs"
                    value={formData.locations}
                    onChange={e => setFormData({ ...formData, locations: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">About Company</label>
                  <textarea
                    rows={4}
                    className="w-full px-3.5 py-2.5 border border-theme rounded-xl bg-secondary/30 text-primary text-xs"
                    placeholder="Brief overview of company culture, products, and tech stack..."
                    value={formData.about}
                    onChange={e => setFormData({ ...formData, about: e.target.value })}
                  />
                </div>

                <div className="pt-4 border-t border-theme flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Company Profile
                  </button>
                </div>

              </div>

            </form>
          )}

        </main>
      </div>
    </div>
  );
}
