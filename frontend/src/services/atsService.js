import api from '../api/axios';

export const atsService = {
  getCompany: () => api.get('/ats/company').then((r) => r.data),
  upsertCompany: (payload) => api.put('/ats/company', payload).then((r) => r.data),
  getProfile: () => api.get('/ats/candidate-profile').then((r) => r.data),
  upsertProfile: (payload) => api.put('/ats/candidate-profile', payload).then((r) => r.data),
  getResumeUrl: () => api.get('/ats/candidate-profile/resume-url').then((r) => r.data),
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/ats/candidate-profile/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },
  createRecruiterJob: (payload) => api.post('/ats/recruiter/jobs', payload).then((r) => r.data),
  listRecruiterJobs: () => api.get('/ats/recruiter/jobs').then((r) => r.data),
  getRecruiterJob: (jobId) => api.get(`/ats/recruiter/jobs/${jobId}`).then((r) => r.data),
  updateRecruiterJob: (jobId, payload) => api.patch(`/ats/recruiter/jobs/${jobId}`, payload).then((r) => r.data),
  deleteRecruiterJob: (jobId) => api.delete(`/ats/recruiter/jobs/${jobId}`),
  listRecruiterCandidates: () => api.get('/ats/recruiter/candidates').then((r) => r.data),
  deleteCandidate: (candidateId) => api.delete(`/ats/recruiter/candidates/${candidateId}`).then((r) => r.data),
  clearJobCandidates: (jobId) => api.delete(`/ats/recruiter/jobs/${jobId}/candidates`).then((r) => r.data),
  disconnectGmail: () => api.delete('/ats/recruiter/gmail/disconnect').then((r) => r.data),
  resetRecruiterData: () => api.post('/ats/recruiter/data/reset').then((r) => r.data),
  generateDescription: (payload) => api.post('/ats/jobs/ai-description', payload).then((r) => r.data),
  searchJobs: (params) => api.get('/ats/jobs/search', { params }).then((r) => r.data),
  saveJob: (jobId) => api.post(`/ats/jobs/${jobId}/save`).then((r) => r.data),
  unsaveJob: (jobId) => api.delete(`/ats/jobs/${jobId}/save`),
  listSavedJobs: () => api.get('/ats/saved-jobs').then((r) => r.data),
  applyToJob: (jobId, payload) => api.post(`/ats/jobs/${jobId}/apply`, payload).then((r) => r.data),
  listApplications: () => api.get('/ats/applications').then((r) => r.data),
  getApplication: (applicationId) => api.get(`/ats/applications/${applicationId}`).then((r) => r.data),
  updateApplication: (applicationId, payload) => api.patch(`/ats/applications/${applicationId}`, payload).then((r) => r.data),
  listNotifications: () => api.get('/notifications').then((r) => r.data),
  markNotificationRead: (notificationId) => api.patch(`/notifications/${notificationId}`).then((r) => r.data),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  getAnalytics: () => api.get('/ats/analytics/overview').then((r) => r.data),
};

export default atsService;