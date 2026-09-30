import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getUserDetail, updateUserStatus } from '../../services/admin';
import {
  User,
  ArrowLeft,
  Mail,
  Calendar,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  XCircle,
  FileText,
  Activity,
  Building,
  Building2,
  Clock,
  ShieldAlert
} from 'lucide-react';

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getUserDetail(id);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Error fetching user detail:', err);
      setError(err.response?.data?.detail || 'Could not load user detail from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!data?.user) return;
    setActionLoading(true);
    setMessage('');
    try {
      const res = await updateUserStatus(id, { is_active: !data.user.is_active });
      if (res.success) {
        setMessage(`User status updated to ${!data.user.is_active ? 'Active' : 'Inactive'}.`);
        fetchUserDetail();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update user status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="User Detail">
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
          <p className="text-xs font-mono text-secondary">Loading account profile & linked data...</p>
        </div>
      </AdminLayout>
    );
  }

  const u = data?.user || {};
  const profile = data?.profile || {};
  const applications = data?.applications || [];
  const resumes = data?.resumes || [];
  const companies = data?.companies || [];
  const jobs = data?.jobs || [];
  const logs = data?.activity_logs || [];

  return (
    <AdminLayout title={`User Detail — ${u.name || 'User'}`}>
      <div className="space-y-6">
        
        {/* Back Button & Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card-bg border border-theme p-6 rounded-2xl">
          <div className="space-y-1">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-secondary hover:text-primary mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Users
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-extrabold text-primary font-mono">{u.name}</h2>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono uppercase ${
                u.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                u.role === 'recruiter' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                u.role === 'tpo' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}>
                {u.role}
              </span>
            </div>
            <p className="text-xs text-secondary font-mono">{u.email}</p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <button
              onClick={handleToggleActive}
              disabled={actionLoading}
              className={`px-4 py-2 rounded-xl font-bold border transition-colors ${
                u.is_active !== false
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              {actionLoading ? 'Updating...' : u.is_active !== false ? 'Deactivate Account' : 'Activate Account'}
            </button>
          </div>
        </div>

        {/* Feedback alerts */}
        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono rounded-xl">✕ {error}</div>}
        {message && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-xl">✓ {message}</div>}

        {/* User Account Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          
          {/* Card 1: Core User Metadata */}
          <div className="bg-card-bg border border-theme p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">Account Credentials</h3>
            <div className="space-y-2 text-secondary">
              <div><span className="text-primary font-bold">User ID:</span> {u.id}</div>
              <div><span className="text-primary font-bold">Email:</span> {u.email}</div>
              <div><span className="text-primary font-bold">Role:</span> {u.role}</div>
              <div>
                <span className="text-primary font-bold">Account Status: </span>
                {u.is_active !== false ? (
                  <span className="text-emerald-400 font-bold">Active</span>
                ) : (
                  <span className="text-red-400 font-bold">Inactive</span>
                )}
              </div>
              <div><span className="text-primary font-bold">Registered:</span> {u.created_at ? new Date(u.created_at).toLocaleString() : 'N/A'}</div>
            </div>
          </div>

          {/* Card 2: Student Profile Info if Student */}
          {u.role === 'student' && (
            <div className="md:col-span-2 bg-card-bg border border-theme p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">Student Profile Details</h3>
              {profile ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-secondary">
                  <div><span className="text-primary font-bold">Full Name:</span> {profile.full_name || 'N/A'}</div>
                  <div><span className="text-primary font-bold">Phone:</span> {profile.phone || 'N/A'}</div>
                  <div><span className="text-primary font-bold">College:</span> {profile.college || 'N/A'}</div>
                  <div><span className="text-primary font-bold">Degree & Branch:</span> {profile.degree} - {profile.branch}</div>
                  <div><span className="text-primary font-bold">Graduation Year:</span> {profile.graduation_year || 'N/A'}</div>
                  <div><span className="text-primary font-bold">CGPA:</span> {profile.cgpa ?? 'N/A'}</div>
                  <div><span className="text-primary font-bold">Placement Status:</span> <span className="uppercase text-emerald-400 font-bold">{profile.placement_status || 'unplaced'}</span></div>
                  <div><span className="text-primary font-bold">Profile Completion:</span> {profile.profile_completion || 0}%</div>
                </div>
              ) : (
                <p className="text-secondary text-xs">No extended student profile data created yet.</p>
              )}
            </div>
          )}

          {/* Card 3: Recruiter Profile Info if Recruiter */}
          {u.role === 'recruiter' && (
            <div className="md:col-span-2 bg-card-bg border border-theme p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">Managed Companies & Jobs</h3>
              <div className="space-y-3">
                <p><span className="text-primary font-bold">Companies Registered:</span> {companies.length}</p>
                <p><span className="text-primary font-bold">Jobs Posted:</span> {jobs.length}</p>
                {jobs.map(j => (
                  <div key={j.id} className="p-3 bg-secondary/40 border border-theme rounded-lg flex justify-between">
                    <span className="font-bold text-primary">{j.title}</span>
                    <span className="text-indigo-400">{j.package_lpa} LPA</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Linked Applications / Resumes if Student */}
        {u.role === 'student' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Applications List */}
            <div className="bg-card-bg border border-theme p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-extrabold text-primary font-mono uppercase tracking-wider">Job Applications ({applications.length})</h3>
              {applications.length === 0 ? (
                <p className="text-xs font-mono text-secondary">No job applications submitted by this student.</p>
              ) : (
                <div className="space-y-2 font-mono text-xs">
                  {applications.map(app => (
                    <div key={app.id} className="p-3 bg-secondary/40 border border-theme rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-primary">{app.job_title || 'Placement Drive'}</div>
                        <div className="text-[10px] text-secondary">Applied: {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resumes List */}
            <div className="bg-card-bg border border-theme p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-extrabold text-primary font-mono uppercase tracking-wider">Resumes ({resumes.length})</h3>
              {resumes.length === 0 ? (
                <p className="text-xs font-mono text-secondary">No resumes uploaded by this student.</p>
              ) : (
                <div className="space-y-2 font-mono text-xs">
                  {resumes.map(r => (
                    <div key={r.id} className="p-3 bg-secondary/40 border border-theme rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-primary">{r.file_name}</div>
                        <div className="text-[10px] text-secondary">ATS Score: {r.ats_score ?? 'N/A'}</div>
                      </div>
                      {r.is_active && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active Resume
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Activity Logs */}
        <div className="bg-card-bg border border-theme p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-extrabold text-primary font-mono uppercase tracking-wider">Account Audit Logs</h3>
          {logs.length === 0 ? (
            <p className="text-xs font-mono text-secondary">No audit logs recorded for this user.</p>
          ) : (
            <div className="space-y-2 font-mono text-xs">
              {logs.map(l => (
                <div key={l.id} className="p-3 bg-secondary/40 border border-theme rounded-xl flex justify-between items-center text-secondary">
                  <div>
                    <span className="font-bold text-primary">{l.action}</span>
                    <p className="text-[11px] truncate max-w-md">{JSON.stringify(l.details || {})}</p>
                  </div>
                  <span className="text-[10px]">{l.timestamp ? new Date(l.timestamp).toLocaleString() : 'N/A'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
