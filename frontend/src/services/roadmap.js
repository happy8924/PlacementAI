import api from './api';

export const getMyRoadmap = async () => {
  const response = await api.get('/roadmap/my-roadmap');
  return response.data;
};

export const updateMilestoneStatus = async (milestoneId, newStatus) => {
  const response = await api.post('/roadmap/update-milestone', {
    milestone_id: milestoneId,
    new_status: newStatus,
  });
  return response.data;
};
