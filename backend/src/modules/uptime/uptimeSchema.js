const uuidSchema = { type: "string", format: "uuid" };

const endPointSchema = {
  id: uuidSchema,
  project_id: uuidSchema,
  url: { type: "string" },
  check_interval_seconds: { type: "number" },
  is_active: { type: "boolean" },
  created_at: { type: "string" },
};
// CREATE TABLE monitored_endpoints (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
//     url VARCHAR(500) NOT NULL,
//     check_interval_seconds INTEGER DEFAULT 30,
//     is_active BOOLEAN DEFAULT TRUE,
//     created_at TIMESTAMPTZ DEFAULT NOW()
// );

// POST   /projects/:projectId/endpoints        → Add URL to monitor
// GET    /projects/:projectId/endpoints        → List all monitored URLs
// GET    /endpoints/:endpointId                → Get one endpoint
// PUT    /endpoints/:endpointId                → Update endpoint (URL, interval)
// DELETE /endpoints/:endpointId                → Stop monitoring URL
// GET    /endpoints/:endpointId/checks         → Get recent checks (uptime history)
// GET    /endpoints/:endpointId/incidents      → Get incident history
// GET    /endpoints/:endpointId/uptime         → Get uptime % (99.9%)

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

// CREATE TABLE uptime_incidents (
//     id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
//     endpoint_id      UUID         NOT NULL REFERENCES monitored_endpoints(id) ON DELETE CASCADE,
//     started_at       TIMESTAMPTZ  DEFAULT NOW(),
//     resolved_at      TIMESTAMPTZ,
//     status           VARCHAR(20)  DEFAULT 'open',
//     failure_count    INTEGER      DEFAULT 1,
//     last_error       TEXT
// );

// CREATE TABLE uptime_checks (
//     time TIMESTAMPTZ NOT NULL,
//     endpoint_id UUID NOT NULL REFERENCES monitored_endpoints(id) ON DELETE CASCADE,
//     is_up BOOLEAN NOT NULL,
//     status_code INTEGER,
//     response_time_ms DOUBLE PRECISION,
//     error_message TEXT
// );
