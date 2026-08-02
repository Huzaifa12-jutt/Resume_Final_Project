import api from '../api/axios';
import { endpoints } from '../api/endpoints';

// The backend identifies the recruiter from the JWT (attached automatically by
// the axios interceptor), so no user_id query params are needed here.
export const gmailService = {
  getAuthUrl: async () => {
    const response = await api.get(endpoints.gmail.auth);
    return response.data;
  },

  fetchEmails: async (jobId) => {
    const response = await api.post(endpoints.gmail.fetch, null, {
      params: jobId ? { job_id: jobId } : {}
    });
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get(endpoints.gmail.status);
    return response.data;
  },

  disconnect: async () => {
    const response = await api.delete(endpoints.gmail.disconnect);
    return response.data;
  }
};
