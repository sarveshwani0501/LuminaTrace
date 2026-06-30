import api from './client';

export const metricsApi = {
 
  getLatestMetrics: (projectId, serverId = null) => {
    let url = `/metrics/latest?projectId=${projectId}`;
    if (serverId) url += `&serverId=${serverId}`;
    return api.get(url);
  },

  
  getTimeseries: (projectId, metricName, timerange = '1h', serverId = null) => {
    let url = `/metrics/timeseries?projectId=${projectId}&metricName=${metricName}&timerange=${timerange}`;
    if (serverId) url += `&serverId=${serverId}`;
    return api.get(url);
  },

  
  getTimeseriesP99: (projectId, timerange = '1h', serverId = null) => {
    let url = `/metrics/timeseries/p99?projectId=${projectId}&timerange=${timerange}`;
    if (serverId) url += `&serverId=${serverId}`;
    return api.get(url);
  },

  
  getThroughput: (projectId, timerange = '1h', serverId = null) => {
    let url = `/metrics/timeseries/throughput?projectId=${projectId}&timerange=${timerange}`;
    if (serverId) url += `&serverId=${serverId}`;
    return api.get(url);
  },


  getErrorRate: (projectId, timerange = '1h', serverId = null) => {
    let url = `/metrics/timeseries/error-rate?projectId=${projectId}&timerange=${timerange}`;
    if (serverId) url += `&serverId=${serverId}`;
    return api.get(url);
  },

 
  getActiveConnections: (projectId, timerange = '1h', serverId = null) => {
    let url = `/metrics/timeseries?projectId=${projectId}&metricName=active_connections&timerange=${timerange}`;
    if (serverId) url += `&serverId=${serverId}`;
    return api.get(url);
  },
};
