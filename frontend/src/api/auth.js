import api from './client';

export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  
  sendVerificationEmail: (data) => api.post('/auth/verify-email/send', data),
  verifyEmail: (data) => api.post('/auth/verify-email/verify', data),
  
  requestPasswordReset: (data) => api.post('/auth/password-reset/request', data),
  resetPassword: (data) => api.post('/auth/password-reset/reset', data),
};
