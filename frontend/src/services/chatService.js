import api from '../api/axios';
import { endpoints } from '../api/endpoints';

export const chatService = {
  getChatHistory: (jobId) => api.get(endpoints.chatHistory(jobId)).then((r) => r.data),
  sendMessage: (jobId, message) => api.post(endpoints.chat(jobId), { message }).then((r) => r.data),
};
