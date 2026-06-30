import api from './client';

export const logsApi = {

  getLogs: (projectId, params) => {
    
    return api.get('/logs', {
      params: { projectId, ...params }
    });
  },

  
  getRecentLogs: (projectId, limit = 100) => {
    return api.get(`/logs/recent?projectId=${projectId}&limit=${limit}`);
  },

  getStats: (projectId) => {
    return api.get(`/logs/stats?projectId=${projectId}`);
  },

  getTopRoutes: (projectId, timerange = '24h', limit = 10, sortBy = 'count') => {
    return api.get(`/logs/routes?projectId=${projectId}&timerange=${timerange}&limit=${limit}&sortBy=${sortBy}`);
  },

  getVolume: (projectId, timerange = '1h') => {
    return api.get(`/logs/volume?projectId=${projectId}&timerange=${timerange}`);
  },

  getErrorRate: (projectId, timerange = '1h') => {
    return api.get(`/logs/error?projectId=${projectId}&timerange=${timerange}`);
  },

  getLogsByTrace: (projectId, traceId) => {
    return api.get(`/logs/${traceId}?projectId=${projectId}`);
  }
};
