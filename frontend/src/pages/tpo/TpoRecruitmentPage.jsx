import React, { useEffect, useState } from 'react';
import TpoLayout from '../../components/tpo/TpoLayout';
import {
  getTpoRecruitmentJobs,
  getTpoJobEligibleStudents,
  getTpoJobPipeline
} from '../../services/tpo';
import {
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Calendar,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
  Target
} from 'lucide-react';

export default function TpoRecruitmentPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected modals
  const [activeJob, setActiveJob] = useState(null);
  const [modalType, setModalType] = useState(null); // 'eligibility' or 'pipeline'
  const [eligibilityData, setEligibilityData] = useState(null);
  const [pipelineData, setPipelineData] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTpoRecruitmentJobs(statusFilter);
      if (res.success) {
        setJobs(res.jobs);
      }
    } catch (err) {
      console.error('Failed to load recruitment jobs:', err);
      setError(err.response?.data?.detail || 'Failed to load recruitment jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const openEligibilityModal = async (job) => {
    setActiveJob(job);
    setModalType('eligibility');
    setLoadingModal(true);
    try {
      const res = await getTpoJobEligibleStudents(job.id);
      if (res.success) {
        setEligibilityData(res);
      }
    } catch (err) {
      console.error('Failed to evaluate eligibility:', err);
    } finally {
      setLoadingModal(false);
    }
  };

  const openPipelineModal = async (job) => {
    setActiveJob(job);
    setModalType('pipeline');
    setLoadingModal(true);
    try {
      const res = await getTpoJobPipeline(job.id);
      if (res.success) {
        setPipelineData(res);
      }
    } catch (err) {
      console.error('Failed to load pipeline:', err);
    } finally {
      setLoadingModal(false);
    }
  };

  const closeModal = () => {
    setActiveJob(null);
    setModalType(null);
    setEligibilityData(null);
    setPipelineData(null);
  };

  return (
    <TpoLayout title="Recruitment Drives & Eligibility Audits">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-primary tracking-tight font-sans">
            Recruitment Drive Oversight
          </h2>
          <p className="text-xs text-secondary font-mono">
            Audit drive requirements, verify student eligibility matches, and track candidate pipeline progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-secondary border border-theme rounded-xl text-primary font-mono text-xs focus:outline-none focus:border-indigo-500/50"
          >
            <option value="all">All Statuses</option>
            <option value="open">Active Open Drives</option>
            <option value="closed">Closed Drives</option>
            <option value="pending_approval">Pending Moderation</option>
          </select>

          <button
            onClick={fetchJobs}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-secondary border border-theme hover:bg-card-bg text-secondary hover:text-primary rounded-xl font-mono text-xs font-semibold transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-mono text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Drives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 font-mono text-xs">
        {loading ? (
          <div className="col-span-full p-12 text-center text-secondary space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
            <p>Scanning active recruitment drives...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="col-span-full p-12 text-center text-secondary space-y-2 bg-card-bg border border-theme rounded-2xl">
            <Briefcase className="w-8 h-8 mx-auto text-indigo-400" />
            <p className="font-bold text-primary">No Recruitment Drives Found</p>
            <p className="text-[11px]">No matching job posts in the selected category.</p>
          </div>
        ) : (
          jobs.map((job) => {
            const metrics = job.metrics || {};
            const isOpen = job.status === 'open';

            return (
              <div
                key={job.id}
                className="p-5 rounded-2xl bg-card-bg border border-theme shadow-sm hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-400">
                        {job.company_name}
                      </span>
                      <h3 className="font-bold text-sm text-primary font-sans leading-tight">
                        {job.title}
                      </h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isOpen
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-secondary text-secondary border border-theme'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="p-3 bg-secondary rounded-xl border border-theme space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-secondary">Package:</span>
                      <strong className="text-emerald-400">{job.salary_package || 'N/A'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Cutoff CGPA:</span>
                      <strong className="text-primary">{job.min_cgpa ? `${job.min_cgpa} CGPA` : 'No Cutoff'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Location:</span>
                      <span className="text-primary truncate max-w-[140px]">{job.location || 'Remote'}</span>
                    </div>
                  </div>

                  {/* Funnel Counters */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="p-2 rounded-lg bg-secondary/70 border border-theme">
                      <div className="font-bold text-primary text-xs">{metrics.total_applicants || 0}</div>
                      <div className="text-secondary">Applied</div>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/70 border border-theme">
                      <div className="font-bold text-indigo-400 text-xs">{metrics.shortlisted || 0}</div>
                      <div className="text-secondary">Shortlist</div>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/70 border border-theme">
                      <div className="font-bold text-emerald-400 text-xs">{metrics.offered || 0}</div>
                      <div className="text-secondary">Offers</div>
                    </div>
                  </div>
                </div>

                {/* Audit Action Buttons */}
                <div className="pt-2 border-t border-theme flex items-center gap-2">
                  <button
                    onClick={() => openEligibilityModal(job)}
                    className="flex-1 py-2 px-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors text-[11px]"
                  >
                    <Target className="w-3.5 h-3.5" />
                    Eligibility Match
                  </button>
                  <button
                    onClick={() => openPipelineModal(job)}
                    className="py-2 px-3 bg-secondary hover:bg-card-bg border border-theme text-secondary hover:text-primary rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors text-[11px]"
                    title="Audit Candidate Pipeline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Pipeline
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Eligibility Derivation Modal */}
      {modalType === 'eligibility' && activeJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card-bg border border-theme max-w-3xl w-full rounded-2xl shadow-2xl p-6 space-y-5 font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400">{activeJob.company_name}</span>
                <h3 className="text-sm font-bold text-primary uppercase">
                  Candidate Eligibility Verification: {activeJob.title}
                </h3>
              </div>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-secondary text-secondary hover:text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingModal ? (
              <div className="p-12 text-center text-secondary space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
                <p>Calculating academic and skill matches...</p>
              </div>
            ) : eligibilityData ? (
              <div className="space-y-4">
                {/* Criteria Bar */}
                <div className="p-3 bg-secondary rounded-xl border border-theme flex flex-wrap gap-4 text-[11px]">
                  <div><span className="text-secondary">Min CGPA:</span> <strong className="text-primary">{eligibilityData.criteria.min_cgpa || 'None'}</strong></div>
                  <div><span className="text-secondary">Eligible Branches:</span> <strong className="text-primary">{eligibilityData.criteria.eligible_branches?.length ? eligibilityData.criteria.eligible_branches.join(', ') : 'All Branches'}</strong></div>
                  <div><span className="text-secondary">Required Skills:</span> <strong className="text-indigo-400">{eligibilityData.criteria.requirements?.join(', ') || 'General'}</strong></div>
                </div>

                {/* Counters */}
                <div className="flex gap-4">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex-1 text-center">
                    <div className="text-lg font-bold">{eligibilityData.counts.eligible}</div>
                    <div className="text-[10px] uppercase font-bold">Eligible Candidates</div>
                  </div>
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex-1 text-center">
                    <div className="text-lg font-bold">{eligibilityData.counts.ineligible}</div>
                    <div className="text-[10px] uppercase font-bold">Ineligible Candidates</div>
                  </div>
                </div>

                {/* Eligible Students Table */}
                <div className="space-y-2">
                  <h4 className="font-bold text-primary uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Qualified Students ({eligibilityData.eligible_students.length})
                  </h4>
                  <div className="max-h-60 overflow-y-auto border border-theme rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-secondary text-secondary sticky top-0">
                        <tr>
                          <th className="p-2.5">Student</th>
                          <th className="p-2.5">Branch</th>
                          <th className="p-2.5">CGPA</th>
                          <th className="p-2.5">Skills Match</th>
                          <th className="p-2.5">Application</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-theme">
                        {eligibilityData.eligible_students.map((st) => (
                          <tr key={st.id} className="hover:bg-secondary/40">
                            <td className="p-2.5 font-bold text-primary">{st.name} ({st.app_id})</td>
                            <td className="p-2.5 text-secondary">{st.branch}</td>
                            <td className="p-2.5 text-emerald-400 font-bold">{st.cgpa}</td>
                            <td className="p-2.5 text-indigo-400">{st.matched_skills_count}/{st.total_req_skills}</td>
                            <td className="p-2.5">
                              <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-secondary text-secondary">
                                {st.application_status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="pt-2 flex justify-end">
              <button onClick={closeModal} className="px-4 py-2 bg-secondary border border-theme rounded-xl text-secondary hover:text-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recruitment Pipeline Audit Modal */}
      {modalType === 'pipeline' && activeJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card-bg border border-theme max-w-3xl w-full rounded-2xl shadow-2xl p-6 space-y-5 font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400">{activeJob.company_name}</span>
                <h3 className="text-sm font-bold text-primary uppercase">
                  Candidate Pipeline Audit: {activeJob.title}
                </h3>
              </div>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-secondary text-secondary hover:text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingModal ? (
              <div className="p-12 text-center text-secondary space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
                <p>Auditing recruiter pipeline logs...</p>
              </div>
            ) : pipelineData ? (
              <div className="space-y-4">
                <p className="text-secondary text-[11px]">
                  Institutional Audit Policy: TPO monitors recruiter stage progression and interview outcomes in read-only mode.
                </p>

                {pipelineData.applications.length === 0 ? (
                  <div className="p-8 text-center text-secondary">
                    No student applications have been logged for this drive yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-theme rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-secondary text-secondary">
                        <tr>
                          <th className="p-3">Applicant</th>
                          <th className="p-3">Applied On</th>
                          <th className="p-3">Recruiter Stage</th>
                          <th className="p-3">Interview Feedback</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-theme">
                        {pipelineData.applications.map((app) => (
                          <tr key={app.id} className="hover:bg-secondary/40">
                            <td className="p-3">
                              <div className="font-bold text-primary">{app.student_name || 'Candidate'}</div>
                              <div className="text-[10px] text-secondary">{app.app_id} • {app.student_email}</div>
                            </td>
                            <td className="p-3 text-secondary">
                              {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                {app.status}
                              </span>
                            </td>
                            <td className="p-3 text-secondary text-[10px]">
                              {app.feedback || app.interviews?.[0]?.feedback || 'Evaluation in progress'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null}

            <div className="pt-2 flex justify-end">
              <button onClick={closeModal} className="px-4 py-2 bg-secondary border border-theme rounded-xl text-secondary hover:text-primary">
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </TpoLayout>
  );
}
