import api from '../api/axios';

export const authService = {
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  verifyEmail: (payload) => api.post('/auth/verify-email', payload).then((r) => r.data),
  login: (payload) => {
    console.log('🔵 authService.login called with:', payload);
    return api.post('/auth/login', payload).then((r) => {
      console.log('🔵 authService.login API response:', r.data);
      return r.data;
    });
  },
  me: () => {
    console.log('🔵 authService.me called');
    return api.get('/auth/me').then((r) => {
      console.log('🔵 authService.me API response:', r.data);
      return r.data;
    });
  },
  updateMe: (payload) => api.patch('/auth/me', payload).then((r) => r.data),
  resendCode: (payload) => api.post('/auth/resend-code', payload),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
  logout: () => api.post('/auth/logout'),
};

export default authService;
