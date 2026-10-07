import React, { useState, useEffect } from 'react';
import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar';
import RecruiterHeader from '../../components/recruiter/RecruiterHeader';
import {
  Briefcase,
  Plus,
  Send,
  Building2,
  MapPin,
  DollarSign,
  GraduationCap,
  Calendar,
  X,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { getRecruiterJobs, createRecruiterJob, updateJobStatus, triggerJobBroadcast } from '../../services/recruiter';

export default function RecruiterJobsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [broadcastLoading, setBroadcastLoading] = useState(null);
  const [notification, setNotification] = useState(null);

  // Form State matching Email Automation workflow fields
  const [formData, setFormData] = useState({
    title: '',
    role: '',
    department: '',
    recruiter_name: '',
    official_email: '',
    phone: '',
    designation: '',
    company_name: '',
    company_website: '',
    company_careers_url: '',
    company_linkedin: '',
    company_description: '',
    employment_type: 'Full-time',
    number_of_openings: 1,
    location: '',
    work_mode: 'On-site',
    salary_package: '',
    experience_required: '0-2 Years',
    min_cgpa: 6.0,
    eligible_branches: 'Computer Science, Information Technology, MCA, ECE',
    requirements: 'React, Node.js, Python, MongoDB',
    preferred_skills: 'Docker, FastAPI, LLM',
    description: '',
    responsibilities: '',
    selection_process: 'Aptitude Test -> Technical Interview -> HR Round',
    deadline: '',
    joining_date: '',
    apply_link: '',
    hr_contact_email: '',
    status: 'open'
  });

  const fetchJobs = async () => {
    try {
      const res = await getRecruiterJobs();
      if (res.success) {
        setJobs(res.jobs);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load job postings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStatusToggle = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      await updateJobStatus(jobId, newStatus);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      setNotification({ type: 'success', text: `Job status updated to ${newStatus}.` });
    } catch (err) {
      setNotification({ type: 'error', text: "Failed to update job status." });
    }
  };

  const handleBroadcastEmail = async (jobId) => {
    setBroadcastLoading(jobId);
    try {
      const res = await triggerJobBroadcast(jobId);
      if (res.success) {
        setNotification({
          type: 'success',
          text: `Email broadcast completed! Sent ${res.stats.emails_dispatched} emails to eligible candidates.`
        });
      }
    } catch (err) {
      setNotification({ type: 'error', text: err.response?.data?.detail || "Failed to trigger email broadcast." });
    } finally {
      setBroadcastLoading(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        number_of_openings: parseInt(formData.number_of_openings) || 1,
        min_cgpa: parseFloat(formData.min_cgpa) || 0.0,
        eligible_branches: formData.eligible_branches.split(',').map(s => s.trim()).filter(Boolean),
        requirements: formData.requirements.split(',').map(s => s.trim()).filter(Boolean),
        preferred_skills: formData.preferred_skills.split(',').map(s => s.trim()).filter(Boolean),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      };

      const res = await createRecruiterJob(payload);
      if (res.success) {
        setShowCreateModal(false);
        setNotification({
          type: 'success',
          text: `Job '${formData.title}' created and auto-broadcasted to eligible candidates!`
        });
        fetchJobs();
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create job posting.");
    } finally {
      setSubmitting(false);
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
          title="Job Management & Drives"
          subtitle="Post job vacancies, configure eligibility criteria, and trigger automated candidate email broadcasts"
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Top Bar with Post Job Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card-bg p-6 rounded-2xl border border-theme shadow-sm">
            <div>
              <h2 className="text-xl font-extrabold text-primary tracking-tight">Active Placement Drives</h2>
              <p className="text-xs text-secondary font-mono mt-0.5">Manage job postings and match eligible candidates</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Post New Job Vacancy
            </button>
          </div>

          {/* Toast Notification */}
          {notification && (
            <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
              <div className="flex items-center gap-2">
                {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{notification.text}</span>
              </div>
              <button onClick={() => setNotification(null)} className="text-secondary hover:text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Job List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="mt-4 text-secondary text-sm">Loading job vacancies...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-6 text-center text-sm font-mono">
              {error}
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-card-bg border border-theme rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-primary">No Jobs Posted Yet</h3>
              <p className="text-secondary max-w-md mx-auto text-xs font-mono">
                Click 'Post New Job Vacancy' above to create a hiring drive and notify eligible candidates automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-card-bg border border-theme rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
                  
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className={`inline-block text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${job.status === 'open' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-secondary text-secondary'}`}>
                          {job.status}
                        </span>
                        <h3 className="text-lg font-extrabold text-primary mt-1">{job.title || job.job_title}</h3>
                        <p className="text-xs text-secondary font-medium flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                          {job.company_name} • {job.job_type || job.employment_type}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-extrabold text-indigo-600 font-mono">{job.applicant_count || 0}</span>
                        <p className="text-[10px] text-secondary font-mono">Applicants</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 bg-secondary/30 rounded-xl border border-theme text-xs font-mono">
                      <div className="flex items-center gap-2 text-secondary">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span className="truncate">{job.location} ({job.work_mode || 'On-site'})</span>
                      </div>
                      <div className="flex items-center gap-2 text-secondary">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="truncate">{job.salary_package || job.salary_stipend}</span>
                      </div>
                      <div className="flex items-center gap-2 text-secondary">
                        <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                        <span>Min CGPA: {job.min_cgpa}</span>
                      </div>
                      <div className="flex items-center gap-2 text-secondary">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span className="truncate">{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No Deadline'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Skill Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {(job.requirements || job.required_skills || []).map((skill, idx) => (
                        <span key={idx} className="text-[10px] font-mono bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-theme flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleStatusToggle(job.id, job.status)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-colors ${job.status === 'open' ? 'border-amber-500/30 text-amber-600 bg-amber-500/5 hover:bg-amber-500/10' : 'border-emerald-500/30 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10'}`}
                    >
                      {job.status === 'open' ? 'Close Drive' : 'Re-open Drive'}
                    </button>

                    <button
                      onClick={() => handleBroadcastEmail(job.id)}
                      disabled={broadcastLoading === job.id}
                      className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
                    >
                      {broadcastLoading === job.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Broadcast Email to Eligible
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card-bg border border-theme rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-theme pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-primary">Post New Job & Campus Drive</h3>
                <p className="text-xs text-secondary font-mono">Fill in details to initiate eligible student email broadcast</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-secondary hover:text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Job Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-500">1. Job & Role Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">Job Title *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3.5 py-2 border border-theme rounded-xl bg-secondary/30 text-primary text-xs focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Full Stack Developer"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">Target Role / Designation</label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2 border border-theme rounded-xl bg-secondary/30 text-primary text-xs focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. SDE-1"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">Employment Type</label>
                    <select
                      className="w-full px-3.5 py-2 border border-theme rounded-xl bg-secondary/30 text-primary text-xs focus:ring-2 focus:ring-indigo-500"
                      value={formData.employment_type}
                      onChange={e => setFormData({ ...formData, employment_type: e.target.value })}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">Work Mode</label>
                    <select
                      className="w-full px-3.5 py-2 border border-theme rounded-xl bg-secondary/30 text-primary text-xs focus:ring-2 focus:ring-indigo-500"
                      value={formData.work_mode}
                      onChange={e => setFormData({ ...formData, work_mode: e.target.value })}
                    >
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Package & Eligibility */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-500">2. Compensation & Eligibility Criteria</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">Location *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3.5 py-2 border border-theme rounded-xl bg-secondary/30 text-primary text-xs"
                      placeholder="e.g. Bangalore / Remote"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">Salary / Stipend *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3.5 py-2 border border-theme rounded-xl bg-secondary/30 text-primary text-xs"
                      placeholder="e.g. 12 - 16 LPA"
                      value={formData.salary_package}
                      onChange={e => setFormData({ ...formData, salary_package: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">Minimum CGPA *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      className="w-full px-3.5 py-2 border border-theme rounded-xl bg-secondary/30 text-primary text-xs"
                      value={formData.min_cgpa}
                      onChange={e => setFormData({ ...formData, min_cgpa: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">Eligible Branches (Comma separated) *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3.5 py-2 border border-theme rounded-xl bg-secondary/30 text-primary text-xs"
                    placeholder="Computer Science, IT, MCA, ECE"
                    value={formData.eligible_branches}
                    onChange={e => setFormData({ ...formData, eligible_branches: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">Required Tech Skills (Comma separated for 50% match) *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3.5 py-2 border border-theme rounded-xl bg-secondary/30 text-primary text-xs"
                    placeholder="React, Node.js, Python, MongoDB"
                    value={formData.requirements}
                    onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-500">3. Overview & Application Settings</h4>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">Job Description *</label>
                  <textarea
                    rows={3}
                    required
                    className="w-full px-3.5 py-2 border border-theme rounded-xl bg-secondary/30 text-primary text-xs"
                    placeholder="Describe company expectations, role duties..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">Application Deadline</label>
                    <input
                      type="date"
                      className="w-full px-3.5 py-2 border border-theme rounded-xl bg-secondary/30 text-primary text-xs"
                      value={formData.deadline}
                      onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1">Apply Link (Optional)</label>
                    <input
                      type="url"
                      className="w-full px-3.5 py-2 border border-theme rounded-xl bg-secondary/30 text-primary text-xs"
                      placeholder="https://company.careers/apply"
                      value={formData.apply_link}
                      onChange={e => setFormData({ ...formData, apply_link: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-theme flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-theme text-xs font-bold text-secondary hover:bg-secondary/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Publish Drive & Broadcast Email
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
