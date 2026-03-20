// ab schema likhna padega

const uuidSchema = { type: "string", format: "uuid" };

export const logSchema = {
  body: {
    type: "object",
    required: ["logs"],
    properties: {
      logs: {
        type: "array",
        minItems: 1,
        maxItems: 100,
        items: {
          type: "object",
          required: ["timestamp", "level", "message"],
          properties: {
            timestamp: { type: "string", format: "date-time" },
            level: { type: "string", enum: ["INFO", "WARN", "DEBUG", "ERROR"] },
            message: { type: "string", minLength: 1 },
            serverId: uuidSchema,
            traceId: { type: "string" },
            spanId: { type: "string" },
            metadata: { type: "object" },
            hostname: { type: "string" },
          },
        },
      },
    },
  },
  response: {
    202: {
      type: "object",
      properties: {
        message: { type: "string" },
        accepted: { type: "number" },
      },
    },
  },
};

export const metricsSchema = {
  body: {
    type: "object",
    required: ["metrics"],
    properties: {
      metrics: {
        type: "array",
        minItems: 1,
        maxItems: 100,
        items: {
          type: "object",
          required: ["timestamp", "name", "value"],
          properties: {
            timestamp: { type: "string", format: "date-time" },
            name: { type: "string", minLength: 1 },
            value: { type: "number" },
            unit: { type: "string" },
            serverId: uuidSchema,
            tags: { type: "object" },
            hostname: { type: "string" },
          },
        },
      },
    },
  },
  response: {
    202: {
      type: "object",
      properties: {
        message: { type: "string" },
        accepted: { type: "number" },
      },
    },
  },
};

export const heartBeatSchema = {
  body: {
    type: "object",
    required: ["hostname"],
    properties: {
      serverId: uuidSchema,
      hostname: { type: "string" },
      ipAddress: { type: "string" },
      name: { type: "string" },
      environment: { type: "string" },
      tags: { type: "object" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
        serverId: uuidSchema,
      },
    },
  },
};
