import api from './api';

export const getAdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const getUsersList = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const getUserDetail = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const updateUserStatus = async (userId, data) => {
  const response = await api.patch(`/admin/users/${userId}/status`, data);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const getRolesPermissions = async () => {
  const response = await api.get('/admin/roles');
  return response.data;
};

export const getPlacementJobs = async (params = {}) => {
  const response = await api.get('/admin/placement/jobs', { params });
  return response.data;
};

export const getPlacementApplications = async (params = {}) => {
  const response = await api.get('/admin/placement/applications', { params });
  return response.data;
};

export const getPlacementInterviews = async (params = {}) => {
  const response = await api.get('/admin/placement/interviews', { params });
  return response.data;
};

export const getAiOverview = async () => {
  const response = await api.get('/admin/ai/overview');
  return response.data;
};

export const getSystemHealth = async () => {
  const response = await api.get('/admin/system/health');
  return response.data;
};

export const getAuditLogs = async (params = {}) => {
  const response = await api.get('/admin/audit-logs', { params });
  return response.data;
};

export const getPlacementReports = async () => {
  const response = await api.get('/admin/reports');
  return response.data;
};

export const getSystemSettings = async () => {
  const response = await api.get('/admin/settings');
  return response.data;
};

export const updateSystemSettings = async (settingsData) => {
  const response = await api.put('/admin/settings', settingsData);
  return response.data;
};
