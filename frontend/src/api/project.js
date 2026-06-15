import api from './client';

export const projectApi = {
  createProject:     (orgId, data)           => api.post(`/organizations/${orgId}/projects`, data),
  getProjects:       (orgId)                 => api.get(`/organizations/${orgId}/projects`),
  getProjectDetails: (orgId, projId)         => api.get(`/organizations/${orgId}/projects/${projId}`),
  updateProject:     (orgId, projId, data)   => api.put(`/organizations/${orgId}/projects/${projId}`, data),
  deleteProject:     (orgId, projId)         => api.delete(`/organizations/${orgId}/projects/${projId}`),
  rotateApiKey:      (orgId, projId)         => api.put(`/organizations/${orgId}/projects/${projId}/rotate-key`),
};
