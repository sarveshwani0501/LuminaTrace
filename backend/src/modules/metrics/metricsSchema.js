const uuidSchema = { type: "string", format: "uuid" };

export const metricsTimeseriesSchema = {
  querystring: {
    type: "object",
    required: ["projectId", "metricName", "timerange"],
    properties: {
      projectId: uuidSchema,
      metricName: { type: "string", minLength: 1 },
      timerange: {
        type: "string",
        enum: ["30m", "1h", "6h", "24h", "7d", "30d"],
      },
      serverId: uuidSchema,
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              bucket: { type: "string" },
              name: { type: "string" },
              avg_value: { type: "number" },
              min_value: { type: "number" },
              max_value: { type: "number" },
              data_points: { type: "number" },
              unit: { type: "string" },
              server_id: uuidSchema,
              server_name: { type: "string" },
              server_hostname: { type: "string" },
              server_environment: { type: "string" },
            },
          },
        },
        metric_name: { type: "string" },
        interval: { type: "string" },
        from: { type: "string" },
        to: { type: "string" },
        aggregation: { type: "string" },
      },
    },
  },
};

export const latestMetricsSchema = {
  querystring: {
    type: "object",
    required: ["projectId"],
    properties: {
      projectId: uuidSchema,
      serverId: uuidSchema,
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        metrics: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              value: { type: "number" },
              unit: { type: ["string", "null"] },
              timestamp: { type: "string" },
              server_id: { type: ["string", "null"], format: "uuid" },
              server_name: { type: ["string", "null"] },
              server_hostname: { type: ["string", "null"] },
              server_environment: { type: ["string", "null"] },
            },
          },
        },
        source: { type: "string", enum: ["redis", "database"] },
      },
    },
  },
};
