import api from './client';

export const logsApi = {
  /**
   * Primary paginated endpoint for historical logs.
   */
  getLogs: (projectId, params) => {
    // params can contain: timerange, level, serverId, limit, offset
    return api.get('/logs', {
      params: { projectId, ...params }
    });
  },

  /**
   * Instantly fetches the latest 100 logs from Redis cache.
   */
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
