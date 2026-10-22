import api from './api';

// ── TPO Dashboard Metrics ──
export const getTpoDashboardMetrics = async () => {
  const response = await api.get('/tpo/dashboard/metrics');
  return response.data;
};

// ── Pending Approvals & Moderation ──
export const getPendingApprovals = async (role = 'all') => {
  const response = await api.get(`/tpo/approvals/pending?role=${role}`);
  return response.data;
};

export const decideUserApproval = async (userId, decision, reason = '') => {
  const response = await api.post(`/tpo/approvals/user/${userId}`, {
    decision,
    reason,
  });
  return response.data;
};

export const decideJobApproval = async (jobId, decision, reason = '') => {
  const response = await api.post(`/tpo/approvals/job/${jobId}`, {
    decision,
    reason,
  });
  return response.data;
};

// ── Student Directory & Profiles ──
export const getTpoStudents = async (params = {}) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      query.append(key, params[key]);
    }
  });
  const response = await api.get(`/tpo/students?${query.toString()}`);
  return response.data;
};

export const getTpoStudentDetail = async (studentId) => {
  const response = await api.get(`/tpo/students/${studentId}`);
  return response.data;
};

// ── Recruitment & Eligibility Monitoring ──
export const getTpoRecruitmentJobs = async (statusFilter = 'all') => {
  const response = await api.get(`/tpo/recruitment/jobs?status_filter=${statusFilter}`);
  return response.data;
};

export const getTpoJobEligibleStudents = async (jobId) => {
  const response = await api.get(`/tpo/recruitment/job/${jobId}/eligible-students`);
  return response.data;
};

export const getTpoJobPipeline = async (jobId) => {
  const response = await api.get(`/tpo/recruitment/job/${jobId}/pipeline`);
  return response.data;
};

// ── Placement Analytics ──
export const getTpoPlacementAnalytics = async () => {
  const response = await api.get('/tpo/analytics/summary');
  return response.data;
};

// ── Read-Only Audit Timeline ──
export const getTpoAuditLogs = async (action = '', limit = 50) => {
  const query = new URLSearchParams();
  if (action) query.append('action', action);
  query.append('limit', limit);
  const response = await api.get(`/tpo/audit/logs?${query.toString()}`);
  return response.data;
};
