import api from './client';

export const alertsApi = {
  createRule: (projectId, data) => 
    api.post(`/alerts?projectId=${projectId}`, data),

  getRules: (projectId) => 
    api.get(`/alerts?projectId=${projectId}`),

  getRuleById: (projectId, ruleId) => 
    api.get(`/alerts/${ruleId}?projectId=${projectId}`),

  updateRule: (projectId, ruleId, data) => 
    api.patch(`/alerts/${ruleId}?projectId=${projectId}`, data),

  deleteRule: (projectId, ruleId) => 
    api.delete(`/alerts/${ruleId}?projectId=${projectId}`),

  toggleRule: (projectId, ruleId, isActive) => 
    api.patch(`/alerts/${ruleId}/toggle?projectId=${projectId}`, { isActive }),

  getEvents: (projectId, serverId = '') => {
    let url = `/alerts/events?projectId=${projectId}`;
    if (serverId) url += `&serverId=${serverId}`;
    return api.get(url);
  }
};
