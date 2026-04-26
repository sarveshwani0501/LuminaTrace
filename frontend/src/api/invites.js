import api from './client';

export const invitesApi = {
  getInviteInfo: (token) => api.get(`/invites/${token}`),
  acceptAsNewUser: (token, data) => api.post(`/invites/${token}/new`, data),
  acceptAsExistingUser: (token, data) => api.post(`/invites/${token}/existing`, data),
};
