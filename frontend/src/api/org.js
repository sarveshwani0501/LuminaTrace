import api from './client';

export const orgApi = {
  createOrg: (data) => api.post('/organizations', data),
  getOrgs: () => api.get('/organizations'),
  getOrgDetails: (orgId) => api.get(`/organizations/${orgId}`),
  updateOrg: (orgId, data) => api.put(`/organizations/${orgId}`, data),
  deleteOrg: (orgId) => api.delete(`/organizations/${orgId}`),
  
  // Organization members
  getMembers: (orgId) => api.get(`/organizations/${orgId}/members`),
  removeMember: (orgId, memberId) => api.delete(`/organizations/${orgId}/members/${memberId}`),
  
  // Invites
  createInvite: (orgId, data) => api.post(`/organizations/${orgId}/members`, data),
  getInvites: (orgId) => api.get(`/organizations/${orgId}/invites`),
  deleteInvite: (orgId, inviteId) => api.delete(`/organizations/${orgId}/invites/${inviteId}`)
};
