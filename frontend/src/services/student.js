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
