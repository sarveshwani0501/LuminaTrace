const uuidSchema = { type: "string", format: "uuid" };

export const allLogsSchema = {
  querystring: {
    type: "object",
    required: ["projectId"],
    properties: {
      projectId: uuidSchema,
      timerange: {
        type: "string",
        enum: ["30m", "1h", "6h", "24h", "7d", "30d"],
      },
      level: { type: "string", enum: ["INFO", "WARN", "ERROR", "DEBUG"] },
      serverId: uuidSchema,
      limit: { type: "number", default: 100 },
      offset: { type: "number", default: 0 },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        logs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              time: { type: "string" },
              project_id: uuidSchema,
              server_id: { type: ["string", "null"] },
              server_name: { type: ["string", "null"] },
              server_hostname: { type: ["string", "null"] },
              server_environment: { type: ["string", "null"] },
              level: { type: "string" },
              message: { type: "string" },
              trace_id: { type: ["string", "null"] },
              span_id: { type: ["string", "null"] },
              metadata: { type: ["object", "null"] },
            },
          },
        },
        total: { type: "number" },
        limit: { type: "number" },
        offset: { type: "number" },
      },
    },
  },
};

export const recentLogsSchema = {
  querystring: {
    type: "object",
    required: ["projectId"],
    properties: {
      projectId: uuidSchema,
      limit: { type: "number", default: 100, maximum: 100 },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        logs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              timestamp: { type: "string" },
              level: {
                type: "string",
                enum: ["INFO", "DEBUG", "WARN", "ERROR"],
              },
              message: { type: "string" },
              serverId: { type: ["string", "null"] },
              trace_id: { type: ["string", "null"] },
              span_id: { type: ["string", "null"] },
              metadata: { type: ["object", "null"] },
            },
          },
        },
      },
    },
  },
};

export const statsSchema = {
  querystring: {
    type: "object",
    required: ["projectId"],
    properties: {
      projectId: uuidSchema,
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        total_requests: { type: "number" },
        error_count: { type: "number" },
        warn_count: { type: "number" },
        latency_sum: { type: "number" },
        latency_count: { type: "number" },
      },
    },
  },
};

export const topRoutesSchema = {
  querystring: {
    type: "object",
    required: ["projectId"],
    properties: {
      projectId: uuidSchema,
      timerange: {
        type: "string",
        enum: ["30m", "1h", "6h", "24h", "7d", "30d"],
      },
      limit: { type: "number", default: 10 },
      sortBy: {
        type: "string",
        enum: ["count", "errors", "error_rate"],
        default: "count",
      },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        routes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              route: { type: "string" },
              method: { type: "string" },
              request_count: { type: "number" },
              error_count: { type: "number" },
              error_rate: { type: "number" },
            },
          },
        },
      },
    },
  },
};

export const logsVolumeSchema = {
  querystring: {
    type: "object",
    required: ["projectId"],
    properties: {
      projectId: uuidSchema,
      timerange: {
        type: "string",
        enum: ["30m", "1h", "6h", "24h", "7d", "30d"],
      },
      interval: { type: "string" },
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
              time_bucket: { type: "string" },
              log_count: { type: "number" },
            },
          },
        },
        interval: { type: "string" },
        from: { type: "string" },
        to: { type: "string" },
      },
    },
  },
};

export const errorRateSchema = {
  querystring: {
    type: "object",
    required: ["projectId"],
    properties: {
      projectId: uuidSchema,
      timerange: {
        type: "string",
        enum: ["30m", "1h", "6h", "24h", "7d", "30d"],
      },
      interval: { type: "string" },
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
              total_logs: { type: "number" },
              error_count: { type: "number" },
              error_rate: { type: "number" },
            },
          },
        },
        interval: { type: "string" },
        from: { type: "string" },
        to: { type: "string" },
      },
    },
  },
};

export const getLogsByTraceSchema = {
  params: {
    type: "object",
    required: ["traceId"],
    properties: {
      traceId: { type: "string" },
    },
  },
  querystring: {
    type: "object",
    required: ["projectId"],
    properties: {
      projectId: uuidSchema,
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        logs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              time: { type: "string" },
              project_id: uuidSchema,
              server_id: { type: ["string", "null"] },
              level: { type: "string" },
              message: { type: "string" },
              trace_id: { type: ["string", "null"] },
              span_id: { type: ["string", "null"] },
              metadata: { type: ["object", "null"] },
            },
          },
        },
      },
    },
  },
};
