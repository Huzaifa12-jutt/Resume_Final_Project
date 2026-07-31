import api from '../api/axios';
import { endpoints } from '../api/endpoints';

export const gmailService = {
  getAuthUrl: async () => {
    const response = await api.get(endpoints.gmail.auth);
    return response.data;
  },

  fetchEmails: async (userId) => {
    const response = await api.post(endpoints.gmail.fetch, null, {
      params: { user_id: userId }
    });
    return response.data;
  },

  getStatus: async (userId) => {
    const response = await api.get(endpoints.gmail.status, {
      params: { user_id: userId }
    });
    return response.data;
  }
};
