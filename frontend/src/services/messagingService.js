import api from '../api/axios';

export const messagingService = {
  listConversations: () => api.get('/messaging/conversations').then((r) => r.data),
  getConversation: (conversationId) =>
    api.get(`/messaging/conversations/${conversationId}`).then((r) => r.data),
  getMessages: (conversationId, params = {}) =>
    api.get(`/messaging/conversations/${conversationId}/messages`, { params }).then((r) => r.data),
  getOrCreateConversation: (applicationId) =>
    api.post(`/messaging/conversations/application/${applicationId}`).then((r) => r.data),
  sendMessage: (conversationId, message) =>
    api.post(`/messaging/conversations/${conversationId}/messages`, { message }).then((r) => r.data),
  markConversationRead: (conversationId) =>
    api.post(`/messaging/conversations/${conversationId}/read`).then((r) => r.data),
  getUnreadCount: () => api.get('/messaging/unread-count').then((r) => r.data),
};

export default messagingService;
