const uuidSchema = { type: "string", format: "uuid" };

const endPointSchema = {
  id: uuidSchema,
  project_id: uuidSchema,
  url: { type: "string" },
  check_interval_seconds: { type: "number" },
  is_active: { type: "boolean" },
  created_at: { type: "string" },
};

export const createEndpointSchema = {
  body: {
    type: "object",
    properties: {
      url: { type: "string" },
      checkIntervalSeconds: { type: "number" },
    },
  },
  response: {
    201: {
      type: "object",
      properties: endPointSchema,
    },
  },
};

export const updateEndpointSchema = {
  body: {
    type: "object",
    properties: {
      url: { type: "string" },
      checkIntervalSeconds: { type: "number" },
      isActive: { type: "boolean" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: endPointSchema,
    },
  },
};

export const getAllEndpointsSchema = {
  response: {
    200: {
      type: "object",
      properties: {
        endPoints: {
          type: "array",
          items: {
            type: "object",
            properties: endPointSchema,
          },
        },
      },
    },
  },
};

export const getEndpointByIdSchema = {
  response: {
    200: {
      type: "object",
      properties: endPointSchema,
    },
  },
};

export const deleteEndpointSchema = {
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};

export const getRecentUptimesSchema = {
  queryString: {
    type: "object",
    properties: {
      limit: { type: "number" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        recentChecks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              time: { type: "string" },
              endpoint_id: uuidSchema,
              is_up: { type: "boolean" },
              status_code: { type: "number" },
              response_time_ms: { type: "number" },
              error_message: { type: "string" },
            },
          },
        },
      },
    },
  },
};

export const getIncidentHistorySchema = {
  querystring: {
    type: "object",
    properties: {
      limit: { type: "number", default: 50 },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        incidentHistory: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: uuidSchema,
              endpoint_id: uuidSchema,
              started_at: { type: "string" },
              resolved_at: { type: "string" },
              status: { type: "string" },
              failure_count: { type: "number" },
              last_error: { type: "string" },
            },
          },
        },
      },
    },
  },
};

export const getUptimePercentSchema = {
  querystring: {
    type: "object",
    properties: {
      period: {
        type: "string",
        enum: ["1h", "6h", "24h", "7d", "30d"],
        default: "24h",
      },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        totalChecks: { type: "number" },
        successfulChecks: { type: "number" },
        uptimePercentage: { type: "number" },
      },
    },
  },
};

