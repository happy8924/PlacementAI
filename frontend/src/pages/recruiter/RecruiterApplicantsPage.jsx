import React, { useState, useEffect, useMemo } from 'react';
import RecruiterSidebar from '../../components/recruiter/RecruiterSidebar';
import RecruiterHeader from '../../components/recruiter/RecruiterHeader';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Calendar,
  Award,
  ExternalLink,
  Loader2,
  X,
  FileText,
  Zap,
  Kanban,
  List,
  Eye,
  GraduationCap,
  Briefcase,
  Folder,
  Phone,
  Mail,
  Building
} from 'lucide-react';
import { getRecruiterApplicants, updateApplicantStatus, scheduleRecruiterInterview, getApplicantDetail } from '../../services/recruiter';

export default function RecruiterApplicantsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // View mode & filters
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [minCgpaFilter, setMinCgpaFilter] = useState(0);
  const [minIrsFilter, setMinIrsFilter] = useState(0);

  // Candidate Drawer State
  const [drawerCandidate, setDrawerCandidate] = useState(null);
  const [loadingDrawer, setLoadingDrawer] = useState(false);

  // Interview Modal State
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    round: 'Technical Round 1',
    date: '',
    time: '10:00 AM',
    mode: 'Online',
    meeting_link: 'https://meet.google.com/xyz-abc-def',
    notes: 'DSA & Core Technical Assessment'
  });
  const [scheduling, setScheduling] = useState(false);

  const fetchApplicants = async () => {
    try {
      const res = await getRecruiterApplicants();
      if (res.success) {
        setApplicants(res.applicants);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load applicants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicantStatus(appId, newStatus);
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      if (drawerCandidate && drawerCandidate.application_id === appId) {
        setDrawerCandidate(prev => ({ ...prev, status: newStatus }));
      }
      setNotification({ type: 'success', text: `Candidate status updated to '${newStatus}'.` });
    } catch (err) {
      setNotification({ type: 'error', text: err.response?.data?.detail || "Failed to update candidate status." });
    }
  };

  const handleOpenDrawer = async (appId) => {
    setLoadingDrawer(true);
    try {
      const res = await getApplicantDetail(appId);
      if (res.success) {
        setDrawerCandidate(res.candidate);
      }
    } catch (err) {
      setNotification({ type: 'error', text: "Failed to load candidate drawer details." });
    } finally {
      setLoadingDrawer(false);
    }
  };

  const handleOpenInterviewModal = (cand) => {
    setSelectedCandidate(cand);
    setShowInterviewModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    setScheduling(true);

    try {
      const payload = {
        application_id: selectedCandidate.id || selectedCandidate.application_id,
        student_id: selectedCandidate.student_id,
        job_id: selectedCandidate.job_id,
        ...interviewForm
      };

      const res = await scheduleRecruiterInterview(payload);
      if (res.success) {
        setShowInterviewModal(false);
        const appId = selectedCandidate.id || selectedCandidate.application_id;
        setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: 'interview_scheduled' } : a));
        if (drawerCandidate && drawerCandidate.application_id === appId) {
          setDrawerCandidate(prev => ({ ...prev, status: 'interview_scheduled' }));
        }
        setNotification({ type: 'success', text: `Interview scheduled for ${selectedCandidate.student_name}!` });
      }
    } catch (err) {
      setNotification({ type: 'error', text: err.response?.data?.detail || "Failed to schedule interview." });
    } finally {
      setScheduling(false);
    }
  };

  const filteredApplicants = useMemo(() => {
    return applicants.filter(app => {
      const matchesSearch =
        app.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.student_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job_title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
      const matchesCgpa = parseFloat(app.cgpa) >= minCgpaFilter;
      const matchesIrs = (app.irs_score || 0) >= minIrsFilter;

      return matchesSearch && matchesStatus && matchesCgpa && matchesIrs;
    });
  }, [applicants, searchQuery, statusFilter, minCgpaFilter, minIrsFilter]);

  const kanbanColumns = [
    { title: 'Applied', key: 'applied', bg: 'bg-secondary/40' },
    { title: 'Shortlisted', key: 'shortlisted', bg: 'bg-purple-500/5' },
    { title: 'Interview Scheduled', key: 'interview_scheduled', bg: 'bg-amber-500/5' },
    { title: 'Offered', key: 'offered', bg: 'bg-emerald-500/5' },
    { title: 'Selected', key: 'selected', bg: 'bg-teal-500/5' },
    { title: 'Rejected', key: 'rejected', bg: 'bg-red-500/5' }
  ];

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      <RecruiterSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <RecruiterHeader
          title="Applicants & Candidate Pipeline"
          subtitle="Review candidate applications, inspect complete profile drawer, filter by IRS/CGPA, and manage hiring stages"
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Controls & Filters Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card-bg p-4 rounded-2xl border border-theme shadow-sm">
            
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate name, email, or job..."
                className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-theme rounded-xl text-xs text-primary focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              
              {/* View Toggle */}
              <div className="flex items-center bg-secondary/30 p-1 rounded-xl border border-theme">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${viewMode === 'table' ? 'bg-card-bg text-indigo-600 shadow-sm' : 'text-secondary hover:text-primary'}`}
                >
                  <List className="w-3.5 h-3.5" /> Table
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${viewMode === 'kanban' ? 'bg-card-bg text-indigo-600 shadow-sm' : 'text-secondary hover:text-primary'}`}
                >
                  <Kanban className="w-3.5 h-3.5" /> Pipeline Kanban
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-secondary" />
                <select
                  className="px-3 py-2 bg-secondary/30 border border-theme rounded-xl text-xs text-primary font-mono"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Pipeline Stages</option>
                  <option value="applied">Applied</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="offered">Offered</option>
                  <option value="selected">Selected</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <select
                className="px-3 py-2 bg-secondary/30 border border-theme rounded-xl text-xs text-primary font-mono"
                value={minCgpaFilter}
                onChange={e => setMinCgpaFilter(parseFloat(e.target.value))}
              >
                <option value={0}>All CGPA Scores</option>
                <option value={6.0}>CGPA ≥ 6.0</option>
                <option value={7.0}>CGPA ≥ 7.0</option>
                <option value={8.0}>CGPA ≥ 8.0</option>
              </select>

              <select
                className="px-3 py-2 bg-secondary/30 border border-theme rounded-xl text-xs text-primary font-mono"
                value={minIrsFilter}
                onChange={e => setMinIrsFilter(parseInt(e.target.value))}
              >
                <option value={0}>All IRS Scores</option>
                <option value={70}>IRS ≥ 70%</option>
                <option value={80}>IRS ≥ 80%</option>
              </select>

            </div>

          </div>

          {/* Toast Notification */}
          {notification && (
            <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
              <span>{notification.text}</span>
              <button onClick={() => setNotification(null)} className="text-secondary hover:text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Table / Kanban Rendering */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="mt-4 text-secondary text-sm">Loading applicant pipeline...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-6 text-center text-sm font-mono">
              {error}
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="bg-card-bg border border-theme rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-primary">No Candidates Match Filters</h3>
              <p className="text-secondary max-w-md mx-auto text-xs font-mono">
                Try adjusting your search criteria, CGPA range, or status filters.
              </p>
            </div>
          ) : viewMode === 'table' ? (
            /* Table View */
            <div className="bg-card-bg border border-theme rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-theme text-[11px] font-mono uppercase text-secondary">
                      <th className="p-4">Candidate</th>
                      <th className="p-4">Applied Job</th>
                      <th className="p-4">Academic & Skills</th>
                      <th className="p-4">ATS & IRS Match</th>
                      <th className="p-4">Pipeline Stage</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme text-xs">
                    {filteredApplicants.map(cand => (
                      <tr key={cand.id} className="hover:bg-secondary/20 transition-colors">
                        
                        <td className="p-4">
                          <button
                            onClick={() => handleOpenDrawer(cand.id)}
                            className="font-bold text-primary hover:text-indigo-600 transition-colors flex items-center gap-1.5 group text-left"
                          >
                            <span>{cand.student_name}</span>
                            <Eye className="w-3.5 h-3.5 text-secondary group-hover:text-indigo-600" />
                          </button>
                          <p className="text-[11px] text-secondary font-mono">{cand.student_email}</p>
                        </td>

                        <td className="p-4 font-medium text-primary">
                          {cand.job_title}
                          <p className="text-[10px] text-secondary font-mono">{cand.applied_at}</p>
                        </td>

                        <td className="p-4 space-y-1">
                          <p className="font-medium text-primary">{cand.branch} • <span className="font-bold text-indigo-600">CGPA: {cand.cgpa}</span></p>
                          <div className="flex flex-wrap gap-1">
                            {(cand.skills || []).slice(0, 3).map((sk, idx) => (
                              <span key={idx} className="text-[9px] font-mono bg-indigo-500/10 text-indigo-600 px-1.5 py-0.5 rounded">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="p-4 space-y-1">
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">
                            <FileText className="w-3 h-3" />
                            {cand.ats_score}% ATS Match
                          </span>
                          <div>
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded text-[10px]">
                              <Zap className="w-3 h-3" />
                              IRS {cand.irs_score}%
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className={`inline-block text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            cand.status === 'shortlisted' ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' :
                            cand.status === 'interview_scheduled' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                            cand.status === 'offered' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                            cand.status === 'selected' ? 'bg-teal-500/10 text-teal-600 border border-teal-500/20' :
                            cand.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                            'bg-secondary text-secondary'
                          }`}>
                            {cand.status}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            <button
                              onClick={() => handleOpenDrawer(cand.id)}
                              className="px-2.5 py-1.5 border border-theme text-secondary hover:text-primary rounded-lg text-[11px] font-mono font-bold transition-all"
                            >
                              Profile
                            </button>

                            {cand.status === 'applied' && (
                              <button
                                onClick={() => handleStatusChange(cand.id, 'shortlisted')}
                                className="px-2.5 py-1.5 bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 rounded-lg text-[11px] font-mono font-bold transition-all"
                              >
                                Shortlist
                              </button>
                            )}

                            {(cand.status === 'shortlisted' || cand.status === 'applied') && (
                              <button
                                onClick={() => handleOpenInterviewModal(cand)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 rounded-lg text-[11px] font-mono font-bold transition-all"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                Schedule
                              </button>
                            )}

                            {cand.status === 'interview_scheduled' && (
                              <button
                                onClick={() => handleStatusChange(cand.id, 'offered')}
                                className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg text-[11px] font-mono font-bold transition-all"
                              >
                                Offer
                              </button>
                            )}

                            {cand.status === 'offered' && (
                              <button
                                onClick={() => handleStatusChange(cand.id, 'selected')}
                                className="px-2.5 py-1.5 bg-teal-600 text-white hover:bg-teal-700 rounded-lg text-[11px] font-mono font-bold transition-all"
                              >
                                Select
                              </button>
                            )}

                            {cand.status !== 'rejected' && (
                              <button
                                onClick={() => handleStatusChange(cand.id, 'rejected')}
                                className="p-1.5 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                title="Reject Candidate"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}

                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Kanban Pipeline View */
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-6">
              {kanbanColumns.map(col => {
                const colApps = filteredApplicants.filter(a => a.status === col.key);
                return (
                  <div key={col.key} className={`rounded-2xl border border-theme p-4 space-y-3 flex flex-col justify-between ${col.bg}`}>
                    <div className="flex items-center justify-between border-b border-theme pb-2">
                      <h4 className="font-bold text-xs text-primary">{col.title}</h4>
                      <span className="text-[10px] font-mono font-extrabold bg-card-bg px-2 py-0.5 rounded-full border border-theme text-secondary">
                        {colApps.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 min-h-[300px] overflow-y-auto">
                      {colApps.length === 0 ? (
                        <div className="text-center py-8 text-[11px] text-secondary font-mono">
                          No candidates
                        </div>
                      ) : (
                        colApps.map(cand => (
                          <div key={cand.id} className="p-3 bg-card-bg border border-theme rounded-xl shadow-sm space-y-2 text-xs">
                            <div className="flex items-start justify-between">
                              <h5 className="font-bold text-primary">{cand.student_name}</h5>
                              <button onClick={() => handleOpenDrawer(cand.id)} className="text-secondary hover:text-indigo-600">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[10px] text-secondary font-mono">{cand.branch} • CGPA {cand.cgpa}</p>
                            <span className="inline-block text-[9px] font-mono font-bold text-indigo-600 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                              IRS {cand.irs_score}%
                            </span>

                            <div className="pt-2 border-t border-theme flex justify-end gap-1">
                              {col.key === 'applied' && (
                                <button onClick={() => handleStatusChange(cand.id, 'shortlisted')} className="text-[10px] font-mono font-bold text-purple-600 hover:underline">
                                  Shortlist →
                                </button>
                              )}
                              {col.key === 'shortlisted' && (
                                <button onClick={() => handleOpenInterviewModal(cand)} className="text-[10px] font-mono font-bold text-amber-600 hover:underline">
                                  Schedule →
                                </button>
                              )}
                              {col.key === 'interview_scheduled' && (
                                <button onClick={() => handleStatusChange(cand.id, 'offered')} className="text-[10px] font-mono font-bold text-emerald-600 hover:underline">
                                  Offer →
                                </button>
                              )}
                              {col.key === 'offered' && (
                                <button onClick={() => handleStatusChange(cand.id, 'selected')} className="text-[10px] font-mono font-bold text-teal-600 hover:underline">
                                  Select →
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>

      {/* Candidate Detail Drawer Slide-over */}
      {drawerCandidate && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-card-bg h-full border-l border-theme p-6 md:p-8 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between">
            
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-theme pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-primary">{drawerCandidate.student_name}</h3>
                  <p className="text-xs text-secondary font-mono mt-0.5">{drawerCandidate.degree} in {drawerCandidate.branch} ({drawerCandidate.graduation_year})</p>
                </div>
                <button onClick={() => setDrawerCandidate(null)} className="text-secondary hover:text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status & Scores Row */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-secondary/30 rounded-2xl border border-theme text-center">
                <div>
                  <span className="text-[10px] font-mono text-secondary uppercase font-bold">CGPA Score</span>
                  <p className="text-lg font-extrabold text-primary">{drawerCandidate.cgpa}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-secondary uppercase font-bold">ATS Resume</span>
                  <p className="text-lg font-extrabold text-emerald-600">{drawerCandidate.ats_score}%</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-secondary uppercase font-bold">IRS Readiness</span>
                  <p className="text-lg font-extrabold text-indigo-600">{drawerCandidate.irs_score}%</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-xs font-mono text-secondary">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  <span>{drawerCandidate.student_email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span>{drawerCandidate.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-500" />
                  <span>{drawerCandidate.college}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-500">Candidate Technical Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(drawerCandidate.skills || []).map((sk, idx) => (
                    <span key={idx} className="text-xs font-mono bg-indigo-500/10 text-indigo-600 px-2.5 py-1 rounded-lg">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Resume File */}
              {drawerCandidate.resume_url && (
                <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-600">
                    <FileText className="w-4 h-4" />
                    <span>Verified Resume Document</span>
                  </div>
                  <a
                    href={drawerCandidate.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    View Resume <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Scheduled Interviews History */}
              {drawerCandidate.interviews && drawerCandidate.interviews.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-500">Scheduled Interview Rounds</h4>
                  {drawerCandidate.interviews.map(iv => (
                    <div key={iv.id} className="p-3 bg-secondary/40 rounded-xl border border-theme text-xs space-y-1">
                      <div className="flex justify-between font-bold text-primary">
                        <span>{iv.round}</span>
                        <span className="text-indigo-600 font-mono">{iv.status}</span>
                      </div>
                      <p className="text-[11px] text-secondary font-mono">{iv.date} at {iv.time} ({iv.mode})</p>
                      {iv.meeting_link && (
                        <a href={iv.meeting_link} target="_blank" rel="noreferrer" className="text-[11px] text-indigo-600 underline block">
                          Join Link: {iv.meeting_link}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-theme flex items-center justify-between gap-3">
              <button
                onClick={() => handleStatusChange(drawerCandidate.application_id, 'rejected')}
                className="px-4 py-2.5 rounded-xl border border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/10 text-xs font-mono font-bold"
              >
                Reject Candidate
              </button>

              <button
                onClick={() => {
                  const cand = drawerCandidate;
                  setDrawerCandidate(null);
                  handleOpenInterviewModal({
                    id: cand.application_id,
                    student_id: cand.student_id,
                    job_id: cand.job_id,
                    student_name: cand.student_name
                  });
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-mono font-bold shadow-md shadow-indigo-600/20"
              >
                Schedule Interview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showInterviewModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card-bg border border-theme rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-theme pb-4">
              <div>
                <h3 className="text-base font-extrabold text-primary">Schedule Recruitment Interview</h3>
                <p className="text-xs text-secondary font-mono">Candidate: {selectedCandidate.student_name}</p>
              </div>
              <button onClick={() => setShowInterviewModal(false)} className="text-secondary hover:text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-primary mb-1">Interview Round Title *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3.5 py-2 border border-theme rounded-xl bg-secondary/30 text-primary"
                  value={interviewForm.round}
                  onChange={e => setInterviewForm({ ...interviewForm, round: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-primary mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3.5 py-2 border border-theme rounded-xl bg-secondary/30 text-primary"
                    value={interviewForm.date}
                    onChange={e => setInterviewForm({ ...interviewForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold text-primary mb-1">Time *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3.5 py-2 border border-theme rounded-xl bg-secondary/30 text-primary"
                    placeholder="10:30 AM"
                    value={interviewForm.time}
                    onChange={e => setInterviewForm({ ...interviewForm, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-primary mb-1">Interview Mode</label>
                <select
                  className="w-full px-3.5 py-2 border border-theme rounded-xl bg-secondary/30 text-primary"
                  value={interviewForm.mode}
                  onChange={e => setInterviewForm({ ...interviewForm, mode: e.target.value })}
                >
                  <option value="Online">Online Video Meeting</option>
                  <option value="In-Person">In-Person Campus Drive</option>
                  <option value="Hybrid">Hybrid Assessment</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-primary mb-1">Meeting Link / Room URL</label>
                <input
                  type="url"
                  className="w-full px-3.5 py-2 border border-theme rounded-xl bg-secondary/30 text-primary"
                  placeholder="https://meet.google.com/..."
                  value={interviewForm.meeting_link}
                  onChange={e => setInterviewForm({ ...interviewForm, meeting_link: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-primary mb-1">Notes / Guidelines</label>
                <textarea
                  rows={2}
                  className="w-full px-3.5 py-2 border border-theme rounded-xl bg-secondary/30 text-primary"
                  value={interviewForm.notes}
                  onChange={e => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                />
              </div>

              <div className="pt-4 border-t border-theme flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInterviewModal(false)}
                  className="px-4 py-2 rounded-xl border border-theme font-bold text-secondary hover:bg-secondary/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-600/20"
                >
                  {scheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  Confirm Interview Schedule
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
