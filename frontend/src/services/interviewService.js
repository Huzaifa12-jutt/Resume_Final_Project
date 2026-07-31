import api from '../api/axios';

const interviewService = {
  generateInterview: (payload) => api.post('/interview/generate', payload).then((r) => r.data),
  submitAnswer: (payload) => api.post('/interview/answer', payload).then((r) => r.data),
  evaluateInterview: (interviewId) => api.post(`/interview/evaluate?interview_id=${interviewId}`).then((r) => r.data),
  getHistory: () => api.get('/interview/history').then((r) => r.data),
  getInterviewDetails: (interviewId) => api.get(`/interview/${interviewId}`).then((r) => r.data),
};

export default interviewService;
