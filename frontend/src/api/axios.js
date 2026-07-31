import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
});

console.log('🔵 API Base URL:', import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000');

api.interceptors.request.use((config) => {
  console.log('🔵 API Request:', config.method.toUpperCase(), config.url);
  const token = localStorage.getItem('resume_ai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('🔵 API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('🔴 API Error:', error.config?.url, error.response?.status, error.message);
    const message = error.response?.data?.detail || error.message || 'Something went wrong.';
    return Promise.reject(new Error(message));
  },
);

export default api;
