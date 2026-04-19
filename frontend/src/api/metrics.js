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
  },

  /**
   * Fetch P99 Latency specific timeseries (PostgreSQL-backed percentile query).
   */
  getTimeseriesP99: (projectId, timerange = '1h', serverId = null) => {
    let url = `/metrics/timeseries/p99?projectId=${projectId}&timerange=${timerange}`;
    if (serverId) url += `&serverId=${serverId}`;
    return api.get(url);
  },

  /**
   * Fetch Throughput (RPS) timeseries — aggregated from request_count metric.
   */
  getThroughput: (projectId, timerange = '1h', serverId = null) => {
    let url = `/metrics/timeseries/throughput?projectId=${projectId}&timerange=${timerange}`;
    if (serverId) url += `&serverId=${serverId}`;
    return api.get(url);
  },

  /**
   * Fetch Error Rate (%) timeseries — error_count / request_count per bucket.
   */
  getErrorRate: (projectId, timerange = '1h', serverId = null) => {
    let url = `/metrics/timeseries/error-rate?projectId=${projectId}&timerange=${timerange}`;
    if (serverId) url += `&serverId=${serverId}`;
    return api.get(url);
  },

  /**
   * Fetch Active Connections timeseries — uses generic timeseries with metric_name=active_connections.
   */
  getActiveConnections: (projectId, timerange = '1h', serverId = null) => {
    let url = `/metrics/timeseries?projectId=${projectId}&metricName=active_connections&timerange=${timerange}`;
    if (serverId) url += `&serverId=${serverId}`;
    return api.get(url);
  },
};
