import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getPlacementJobs, getPlacementApplications, getPlacementInterviews } from '../../services/admin';
import {
  Briefcase,
  FileCheck,
  Video,
  Building2,
  User,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';

export default function PlacementMonitoringPage() {
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'applications' | 'interviews'

  const [jobsData, setJobsData] = useState([]);
  const [appsData, setAppsData] = useState([]);
  const [interviewsData, setInterviewsData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  useEffect(() => {
    setPage(1);
    fetchTabData(1);
  }, [activeTab]);

  useEffect(() => {
    fetchTabData(page);
  }, [page]);

  const fetchTabData = async (currentPage = page) => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'jobs') {
        const res = await getPlacementJobs({ page: currentPage, limit });
        if (res.success) {
          setJobsData(res.jobs);
          setTotal(res.total);
        }
      } else if (activeTab === 'applications') {
        const res = await getPlacementApplications({ page: currentPage, limit });
        if (res.success) {
          setAppsData(res.applications);
          setTotal(res.total);
        }
      } else if (activeTab === 'interviews') {
        const res = await getPlacementInterviews({ page: currentPage, limit });
        if (res.success) {
          setInterviewsData(res.interviews);
          setTotal(res.total);
        }
      }
    } catch (err) {
      console.error('Error fetching placement data:', err);
      setError('Failed to query database for placement monitoring records.');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <AdminLayout title="Placement Drive Monitoring">
      <div className="space-y-6">
        
        {/* Header Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card-bg border border-theme p-6 rounded-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-extrabold text-primary font-mono uppercase tracking-tight">
                Placement & Drive Oversight
              </h2>
            </div>
            <p className="text-xs text-secondary font-mono">
              Monitor active job postings, application funnels, ATS match scores, and interview performance.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-secondary p-1 border border-theme rounded-xl font-mono text-xs">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'jobs' ? 'bg-red-600 text-white shadow-sm' : 'text-secondary hover:text-primary'
              }`}
            >
              <Briefcase className="w-4 h-4" /> Jobs / Drives
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'applications' ? 'bg-red-600 text-white shadow-sm' : 'text-secondary hover:text-primary'
              }`}
            >
              <FileCheck className="w-4 h-4" /> Applications
            </button>
            <button
              onClick={() => setActiveTab('interviews')}
              className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'interviews' ? 'bg-red-600 text-white shadow-sm' : 'text-secondary hover:text-primary'
              }`}
            >
              <Video className="w-4 h-4" /> Interviews
            </button>
          </div>
        </div>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono rounded-xl">✕ {error}</div>}

        {/* Tab 1: Jobs Table */}
        {activeTab === 'jobs' && (
          <div className="bg-card-bg border border-theme rounded-2xl overflow-hidden font-mono text-xs">
            {loading ? (
              <div className="p-12 text-center text-secondary">
                <div className="w-8 h-8 border-3 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto mb-2"></div>
                Loading job postings...
              </div>
            ) : jobsData.length === 0 ? (
              <div className="p-12 text-center text-secondary">No job postings found in database.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-theme text-[10px] text-secondary uppercase tracking-wider">
                      <th className="py-3 px-4 font-semibold">Job Title & Company</th>
                      <th className="py-3 px-4 font-semibold">Location</th>
                      <th className="py-3 px-4 font-semibold">Package (LPA)</th>
                      <th className="py-3 px-4 font-semibold">Applicants</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme">
                    {jobsData.map(j => (
                      <tr key={j.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-primary">{j.title}</div>
                          <div className="text-[11px] text-secondary">{j.company_name || 'Corporate Partner'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-secondary">{j.location || 'Remote / Onsite'}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-400">{j.package_lpa ? `${j.package_lpa} LPA` : 'N/A'}</td>
                        <td className="py-3.5 px-4 font-bold text-primary">{j.applicant_count || 0}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            j.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-secondary text-secondary'
                          }`}>
                            {j.status || 'active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Applications Table */}
        {activeTab === 'applications' && (
          <div className="bg-card-bg border border-theme rounded-2xl overflow-hidden font-mono text-xs">
            {loading ? (
              <div className="p-12 text-center text-secondary">
                <div className="w-8 h-8 border-3 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto mb-2"></div>
                Loading applications...
              </div>
            ) : appsData.length === 0 ? (
              <div className="p-12 text-center text-secondary">No placement applications submitted yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-theme text-[10px] text-secondary uppercase tracking-wider">
                      <th className="py-3 px-4 font-semibold">Candidate</th>
                      <th className="py-3 px-4 font-semibold">Target Drive</th>
                      <th className="py-3 px-4 font-semibold">Resume Match</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Applied Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme">
                    {appsData.map(a => (
                      <tr key={a.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-primary">{a.student_name || 'Candidate'}</div>
                          <div className="text-[11px] text-secondary">{a.student_email || ''}</div>
                        </td>
                        <td className="py-3.5 px-4 text-primary font-bold">{a.job_title || 'Campus Drive'}</td>
                        <td className="py-3.5 px-4 font-bold text-purple-400">{a.resume_match_score ? `${a.resume_match_score}%` : 'N/A'}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            a.status === 'selected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            a.status === 'shortlisted' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                            a.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-secondary">{a.applied_at ? new Date(a.applied_at).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Interviews Table */}
        {activeTab === 'interviews' && (
          <div className="bg-card-bg border border-theme rounded-2xl overflow-hidden font-mono text-xs">
            {loading ? (
              <div className="p-12 text-center text-secondary">
                <div className="w-8 h-8 border-3 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto mb-2"></div>
                Loading interviews...
              </div>
            ) : interviewsData.length === 0 ? (
              <div className="p-12 text-center text-secondary">No mock interviews conducted yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-theme text-[10px] text-secondary uppercase tracking-wider">
                      <th className="py-3 px-4 font-semibold">Candidate</th>
                      <th className="py-3 px-4 font-semibold">Role Tested</th>
                      <th className="py-3 px-4 font-semibold">Difficulty</th>
                      <th className="py-3 px-4 font-semibold">Completion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme">
                    {interviewsData.map(iv => (
                      <tr key={iv.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-primary">{iv.candidate_name || 'Candidate'}</td>
                        <td className="py-3.5 px-4 text-secondary">{iv.job_role || 'General Software Engineering'}</td>
                        <td className="py-3.5 px-4 font-bold uppercase text-amber-400">{iv.difficulty || 'medium'}</td>
                        <td className="py-3.5 px-4">
                          {iv.is_completed ? (
                            <span className="text-emerald-400 font-bold">Completed</span>
                          ) : (
                            <span className="text-amber-400 font-bold">In Progress</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-card-bg border border-theme rounded-xl flex items-center justify-between font-mono text-xs text-secondary">
            <div>Page {page} of {totalPages} ({total} items)</div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 border border-theme rounded-lg bg-secondary disabled:opacity-40 hover:text-primary"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 border border-theme rounded-lg bg-secondary disabled:opacity-40 hover:text-primary"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
