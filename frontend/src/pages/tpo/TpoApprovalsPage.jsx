import React, { useEffect, useState } from 'react';
import TpoLayout from '../../components/tpo/TpoLayout';
import {
  getPendingApprovals,
  decideUserApproval,
  decideJobApproval
} from '../../services/tpo';
import {
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap,
  Building2,
  Briefcase,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ShieldCheck,
  X
} from 'lucide-react';

export default function TpoApprovalsPage() {
  const [activeTab, setActiveTab] = useState('student'); // 'student', 'recruiter', 'job'
  const [data, setData] = useState({ students: [], recruiters: [], jobs: [] });
  const [counts, setCounts] = useState({ students: 0, recruiters: 0, jobs: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Selected item modal for review
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [itemToReject, setItemToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchApprovals = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPendingApprovals('all');
      if (res.success) {
        setData(res.data);
        setCounts(res.counts);
      }
    } catch (err) {
      console.error('Failed to load approvals:', err);
      setError(err.response?.data?.detail || 'Failed to load approvals queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (item, type) => {
    setProcessingId(item.id);
    setActionSuccess('');
    setError('');
    try {
      if (type === 'job') {
        const res = await decideJobApproval(item.id, 'approve');
        setActionSuccess(res.message);
      } else {
        const res = await decideUserApproval(item.id, 'approve');
        setActionSuccess(res.message);
      }
      if (selectedItem?.id === item.id) setSelectedItem(null);
      await fetchApprovals();
    } catch (err) {
      console.error('Approve failed:', err);
      setError(err.response?.data?.detail || 'Failed to approve item.');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (item, type) => {
    setItemToReject({ ...item, itemType: type });
    setRejectionReason('');
    setRejectionModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      setError('A rejection reason is required.');
      return;
    }
    setProcessingId(itemToReject.id);
    setActionSuccess('');
    setError('');
    try {
      if (itemToReject.itemType === 'job') {
        const res = await decideJobApproval(itemToReject.id, 'reject', rejectionReason);
        setActionSuccess(res.message);
      } else {
        const res = await decideUserApproval(itemToReject.id, 'reject', rejectionReason);
        setActionSuccess(res.message);
      }
      setRejectionModalOpen(false);
      setItemToReject(null);
      if (selectedItem?.id === itemToReject.id) setSelectedItem(null);
      await fetchApprovals();
    } catch (err) {
      console.error('Reject failed:', err);
      setError(err.response?.data?.detail || 'Failed to reject item.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <TpoLayout title="Registration & Drive Moderation Queue">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-primary tracking-tight font-sans">
            Pending Institutional Approvals
          </h2>
          <p className="text-xs text-secondary font-mono">
            Verify credentials, academic credentials, and company authenticity before activating portal access.
          </p>
        </div>

        <button
          onClick={fetchApprovals}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 bg-secondary border border-theme hover:bg-card-bg text-secondary hover:text-primary rounded-xl font-mono text-xs font-semibold transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-theme pb-2">
        <button
          onClick={() => setActiveTab('student')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            activeTab === 'student'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-secondary hover:text-primary hover:bg-secondary'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Students</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'student' ? 'bg-white/20 text-white' : 'bg-secondary text-secondary border border-theme'
          }`}>
            {counts.students}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('recruiter')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            activeTab === 'recruiter'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-secondary hover:text-primary hover:bg-secondary'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Recruiters</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'recruiter' ? 'bg-white/20 text-white' : 'bg-secondary text-secondary border border-theme'
          }`}>
            {counts.recruiters}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('job')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            activeTab === 'job'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-secondary hover:text-primary hover:bg-secondary'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Job Drives</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'job' ? 'bg-white/20 text-white' : 'bg-secondary text-secondary border border-theme'
          }`}>
            {counts.jobs}
          </span>
        </button>
      </div>

      {/* Content Queue */}
      <div className="bg-card-bg border border-theme rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3 font-mono text-xs text-secondary">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
            <p>Scanning pending submissions...</p>
          </div>
        ) : activeTab === 'student' ? (
          /* Students Tab */
          data.students.length === 0 ? (
            <div className="p-12 text-center font-mono text-xs text-secondary space-y-2">
              <ShieldCheck className="w-8 h-8 mx-auto text-emerald-400" />
              <p className="text-primary font-bold">No Pending Student Approvals</p>
              <p>All student onboarding submissions have been reviewed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-secondary/50 border-b border-theme text-secondary text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Roll No / Branch</th>
                    <th className="p-4">Grad Year</th>
                    <th className="p-4">Submitted</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme">
                  {data.students.map((st) => (
                    <tr key={st.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-primary">{st.name}</div>
                        <div className="text-[11px] text-secondary">{st.app_id} • {st.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-primary font-semibold">
                          {st.student_details?.roll_number || st.profile?.roll_number || 'N/A'}
                        </div>
                        <div className="text-secondary text-[11px]">
                          {st.student_details?.branch || st.profile?.branch || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4 text-primary">
                        {st.student_details?.graduation_year || st.profile?.graduation_year || 'N/A'}
                      </td>
                      <td className="p-4 text-secondary text-[11px]">
                        {st.created_at ? new Date(st.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedItem({ ...st, itemType: 'student' })}
                            className="p-1.5 bg-secondary hover:bg-card-bg border border-theme text-secondary hover:text-primary rounded-lg transition-colors"
                            title="View Profile Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            disabled={processingId === st.id}
                            onClick={() => handleApprove(st, 'student')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition-all text-[11px]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            disabled={processingId === st.id}
                            onClick={() => openRejectModal(st, 'student')}
                            className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg font-bold flex items-center gap-1.5 transition-all text-[11px]"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === 'recruiter' ? (
          /* Recruiters Tab */
          data.recruiters.length === 0 ? (
            <div className="p-12 text-center font-mono text-xs text-secondary space-y-2">
              <ShieldCheck className="w-8 h-8 mx-auto text-emerald-400" />
              <p className="text-primary font-bold">No Pending Recruiter Approvals</p>
              <p>All corporate employer registrations are up to date.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-secondary/50 border-b border-theme text-secondary text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Recruiter / Contact</th>
                    <th className="p-4">Company Name</th>
                    <th className="p-4">Designation</th>
                    <th className="p-4">Submitted</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme">
                  {data.recruiters.map((rec) => (
                    <tr key={rec.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-primary">{rec.name}</div>
                        <div className="text-[11px] text-secondary">{rec.app_id} • {rec.email}</div>
                      </td>
                      <td className="p-4 text-primary font-bold">
                        {rec.profile?.company_name || 'Corporate Entity'}
                      </td>
                      <td className="p-4 text-secondary">
                        {rec.profile?.designation || 'Hiring Lead'}
                      </td>
                      <td className="p-4 text-secondary text-[11px]">
                        {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedItem({ ...rec, itemType: 'recruiter' })}
                            className="p-1.5 bg-secondary hover:bg-card-bg border border-theme text-secondary hover:text-primary rounded-lg transition-colors"
                            title="View Profile Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            disabled={processingId === rec.id}
                            onClick={() => handleApprove(rec, 'recruiter')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition-all text-[11px]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            disabled={processingId === rec.id}
                            onClick={() => openRejectModal(rec, 'recruiter')}
                            className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg font-bold flex items-center gap-1.5 transition-all text-[11px]"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Jobs Tab */
          data.jobs.length === 0 ? (
            <div className="p-12 text-center font-mono text-xs text-secondary space-y-2">
              <ShieldCheck className="w-8 h-8 mx-auto text-emerald-400" />
              <p className="text-primary font-bold">No Pending Job Drives</p>
              <p>No job postings currently awaiting institutional verification.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-secondary/50 border-b border-theme text-secondary text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Role Title</th>
                    <th className="p-4">Company</th>
                    <th className="p-4">Package</th>
                    <th className="p-4">Min CGPA</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme">
                  {data.jobs.map((jb) => (
                    <tr key={jb.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-primary">{jb.title}</div>
                        <div className="text-[11px] text-secondary">{jb.job_type || 'Full-time'}</div>
                      </td>
                      <td className="p-4 text-primary font-semibold">
                        {jb.company_name}
                      </td>
                      <td className="p-4 text-emerald-400 font-bold">
                        {jb.salary_package || 'Not specified'}
                      </td>
                      <td className="p-4 text-secondary">
                        {jb.min_cgpa ? `${jb.min_cgpa} CGPA` : 'Open to All'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={processingId === jb.id}
                            onClick={() => handleApprove(jb, 'job')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition-all text-[11px]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            disabled={processingId === jb.id}
                            onClick={() => openRejectModal(jb, 'job')}
                            className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg font-bold flex items-center gap-1.5 transition-all text-[11px]"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Review Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card-bg border border-theme max-w-lg w-full rounded-2xl shadow-2xl p-6 space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <h3 className="text-sm font-bold text-primary uppercase">
                {selectedItem.itemType === 'student' ? 'Student Registration Review' : 'Recruiter Entity Review'}
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg hover:bg-secondary text-secondary hover:text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 bg-secondary/50 p-4 rounded-xl border border-theme">
              <div><span className="text-secondary">Full Name:</span> <strong className="text-primary">{selectedItem.name}</strong></div>
              <div><span className="text-secondary">System ID:</span> <strong className="text-indigo-400">{selectedItem.app_id}</strong></div>
              <div><span className="text-secondary">Email Address:</span> <strong className="text-primary">{selectedItem.email}</strong></div>
              
              {selectedItem.itemType === 'student' && (
                <>
                  <div><span className="text-secondary">Roll Number:</span> <strong className="text-primary">{selectedItem.student_details?.roll_number || 'N/A'}</strong></div>
                  <div><span className="text-secondary">Branch:</span> <strong className="text-primary">{selectedItem.student_details?.branch || 'N/A'}</strong></div>
                  <div><span className="text-secondary">Graduation Year:</span> <strong className="text-primary">{selectedItem.student_details?.graduation_year || 'N/A'}</strong></div>
                </>
              )}

              {selectedItem.itemType === 'recruiter' && (
                <>
                  <div><span className="text-secondary">Company:</span> <strong className="text-primary">{selectedItem.profile?.company_name || 'N/A'}</strong></div>
                  <div><span className="text-secondary">Designation:</span> <strong className="text-primary">{selectedItem.profile?.designation || 'N/A'}</strong></div>
                  <div><span className="text-secondary">Website:</span> <strong className="text-primary">{selectedItem.profile?.website || 'N/A'}</strong></div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-secondary border border-theme rounded-xl text-secondary hover:text-primary"
              >
                Close
              </button>
              <button
                disabled={processingId === selectedItem.id}
                onClick={() => handleApprove(selectedItem, selectedItem.itemType)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve Account
              </button>
              <button
                disabled={processingId === selectedItem.id}
                onClick={() => openRejectModal(selectedItem, selectedItem.itemType)}
                className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl font-bold flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card-bg border border-theme max-w-md w-full rounded-2xl shadow-2xl p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <h3 className="text-sm font-bold text-red-400 uppercase flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Specify Rejection Reason
              </h3>
              <button
                onClick={() => setRejectionModalOpen(false)}
                className="p-1 rounded-lg hover:bg-secondary text-secondary hover:text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-secondary text-[11px]">
              This reason will be stored permanently in the institutional audit log and displayed to the user when attempting access.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Unverified roll number, corporate domain verification failed..."
              className="w-full h-24 p-3 bg-secondary border border-theme rounded-xl text-primary focus:outline-none focus:border-red-500/50 resize-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectionModalOpen(false)}
                className="px-4 py-2 bg-secondary border border-theme rounded-xl text-secondary hover:text-primary"
              >
                Cancel
              </button>
              <button
                disabled={processingId === itemToReject?.id || !rejectionReason.trim()}
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-red-600/20 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </TpoLayout>
  );
}
