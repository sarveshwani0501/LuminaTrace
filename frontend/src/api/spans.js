import api from './client';

export const spansApi = {
  // GET /traces/:traceId/spans?projectId=X
  getSpansByTrace: (traceId, projectId) =>
    api.get(`/traces/${traceId}/spans`, { params: { projectId } }),
};
