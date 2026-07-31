import api from '../api/axios';

export const atsService = {
  getCompany: () => api.get('/company').then((r) => r.data),
  upsertCompany: (payload) => api.put('/company', payload).then((r) => r.data),
  getProfile: () => api.get('/candidate-profile').then((r) => r.data),
  upsertProfile: (payload) => api.put('/candidate-profile', payload).then((r) => r.data),
  getResumeUrl: () => api.get('/candidate-profile/resume-url').then((r) => r.data),
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/candidate-profile/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },
  createRecruiterJob: (payload) => api.post('/recruiter/jobs', payload).then((r) => r.data),
  listRecruiterJobs: () => api.get('/recruiter/jobs').then((r) => r.data),
  getRecruiterJob: (jobId) => api.get(`/recruiter/jobs/${jobId}`).then((r) => r.data),
  updateRecruiterJob: (jobId, payload) => api.patch(`/recruiter/jobs/${jobId}`, payload).then((r) => r.data),
  deleteRecruiterJob: (jobId) => api.delete(`/recruiter/jobs/${jobId}`),
  listRecruiterCandidates: () => api.get('/recruiter/candidates').then((r) => r.data),
  deleteCandidate: (candidateId) => api.delete(`/recruiter/candidates/${candidateId}`).then((r) => r.data),
  clearJobCandidates: (jobId) => api.delete(`/recruiter/jobs/${jobId}/candidates`).then((r) => r.data),
  disconnectGmail: () => api.delete('/recruiter/gmail/disconnect').then((r) => r.data),
  resetRecruiterData: () => api.post('/recruiter/data/reset').then((r) => r.data),
  generateDescription: (payload) => api.post('/jobs/ai-description', payload).then((r) => r.data),
  searchJobs: (params) => api.get('/jobs/search', { params }).then((r) => r.data),
  saveJob: (jobId) => api.post(`/jobs/${jobId}/save`).then((r) => r.data),
  unsaveJob: (jobId) => api.delete(`/jobs/${jobId}/save`),
  listSavedJobs: () => api.get('/saved-jobs').then((r) => r.data),
  applyToJob: (jobId, payload) => api.post(`/jobs/${jobId}/apply`, payload).then((r) => r.data),
  listApplications: () => api.get('/applications').then((r) => r.data),
  getApplication: (applicationId) => api.get(`/applications/${applicationId}`).then((r) => r.data),
  updateApplication: (applicationId, payload) => api.patch(`/applications/${applicationId}`, payload).then((r) => r.data),
  listNotifications: () => api.get('/notifications').then((r) => r.data),
  markNotificationRead: (notificationId) => api.patch(`/notifications/${notificationId}`).then((r) => r.data),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  getAnalytics: () => api.get('/analytics/overview').then((r) => r.data),
};

export default atsService;