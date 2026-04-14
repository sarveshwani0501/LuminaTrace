import api from './client';

export const metricsApi = {
  /**
   * Fetch hot data KPI metrics (Redis-backed).
   */
  getLatestMetrics: (projectId, serverId = null) => {
    let url = `/metrics/latest?projectId=${projectId}`;
    if (serverId) url += `&serverId=${serverId}`;
    return api.get(url);
  },

  /**
   * Fetch historical series data for plotting (PostgreSQL-backed).
   * Default timerange is '1h'.
   */
  getTimeseries: (projectId, metricName, timerange = '1h', serverId = null) => {
    let url = `/metrics/timeseries?projectId=${projectId}&metricName=${metricName}&timerange=${timerange}`;
    if (serverId) url += `&serverId=${serverId}`;
    return api.get(url);
  }
};
