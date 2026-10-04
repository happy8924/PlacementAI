import api from './api';

export const getRecruiterDashboard = async () => {
  const response = await api.get('/recruiter/dashboard');
  return response.data;
};

export const getCandidateRecommendations = async (params = {}) => {
  const response = await api.get('/recruiter/recommendations', { params });
  return response.data;
};

export const getRecruiterProfile = async () => {
  const response = await api.get('/recruiter/profile');
  return response.data;
};

export const updateRecruiterProfile = async (profileData) => {
  const response = await api.put('/recruiter/profile', profileData);
  return response.data;
};

export const getRecruiterJobs = async () => {
  const response = await api.get('/recruiter/jobs');
  return response.data;
};

export const getRecruiterJobDetail = async (jobId) => {
  const response = await api.get(`/recruiter/jobs/${jobId}`);
  return response.data;
};

export const createRecruiterJob = async (jobData) => {
  const response = await api.post('/recruiter/jobs', jobData);
  return response.data;
};

export const updateRecruiterJob = async (jobId, jobData) => {
  const response = await api.put(`/recruiter/jobs/${jobId}`, jobData);
  return response.data;
};

export const updateJobStatus = async (jobId, status) => {
  const response = await api.patch(`/recruiter/jobs/${jobId}/status?status=${status}`);
  return response.data;
};

export const triggerJobBroadcast = async (jobId) => {
  const response = await api.post(`/recruiter/jobs/${jobId}/broadcast`);
  return response.data;
};

export const getRecruiterApplicants = async (params = {}) => {
  const response = await api.get('/recruiter/applicants', { params });
  return response.data;
};

export const getApplicantDetail = async (appId) => {
  const response = await api.get(`/recruiter/applicants/${appId}`);
  return response.data;
};

export const updateApplicantStatus = async (appId, status, notes = '') => {
  const response = await api.patch(`/recruiter/applicants/${appId}/status`, { status, notes });
  return response.data;
};

export const getRecruiterInterviews = async () => {
  const response = await api.get('/recruiter/interviews');
  return response.data;
};

export const scheduleRecruiterInterview = async (interviewData) => {
  const response = await api.post('/recruiter/interviews', interviewData);
  return response.data;
};

export const updateRecruiterInterview = async (interviewId, interviewData) => {
  const response = await api.patch(`/recruiter/interviews/${interviewId}`, interviewData);
  return response.data;
};
