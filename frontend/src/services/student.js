import api from './api';

export const getStudentProfile = async () => {
  const response = await api.get('/student/profile');
  return response.data;
};

export const updateStudentProfile = async (profileData) => {
  const response = await api.put('/student/profile', profileData);
  return response.data;
};

export const getStudentDashboard = async () => {
  const response = await api.get('/student/dashboard');
  return response.data;
};

export const getStudentInterviews = async () => {
  const response = await api.get('/student/interviews');
  return response.data;
};

// Bookmarks
export const getStudentBookmarks = async () => {
  const response = await api.get('/student/bookmarks');
  return response.data;
};

export const addStudentBookmark = async (jobId) => {
  const response = await api.post('/student/bookmarks', { job_id: jobId });
  return response.data;
};

export const removeStudentBookmark = async (jobId) => {
  const response = await api.delete(`/student/bookmarks/${jobId}`);
  return response.data;
};

// Notifications
export const getStudentNotifications = async () => {
  const response = await api.get('/student/notifications');
  return response.data;
};

export const markNotificationRead = async (notificationId) => {
  const response = await api.put(`/student/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.put('/student/notifications/read-all');
  return response.data;
};

// Applications
export const getStudentApplications = async () => {
  const response = await api.get('/student/applications');
  return response.data;
};

export const applyToJob = async (jobId) => {
  const response = await api.post('/student/applications', { job_id: jobId });
  return response.data;
};
