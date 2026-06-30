const uuidSchema = { type: "string", format: "uuid" };

const serversSchema = {
  id: uuidSchema,
  project_id: uuidSchema,
  name: { type: "string" },
  hostname: { type: "string" },
  ip_address: { type: "string" },
  environment: { type: "string" },
  tags: { type: "object" },
  status: { type: "string", enum: ["online", "offline"] },
  last_heartbeat_at: { type: "string" },
  created_at: { type: "string" },
};

export const listServersSchema = {
  queryString: {
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
        servers: {
          type: "array",
          items: {
            type: "object",
            properties: serversSchema,
          },
        },
      },
    },
  },
};

export const getServerSchema = {
  params: {
    type: "object",
    required: ["serverId"],
    properties: {
      serverId: uuidSchema,
    },
  },
  queryString: {
    type: "object",
    required: ["projectId"],
    properties: {
      projectId: uuidSchema,
    },
  },
  response: {
    200: {
      type: "object",
      properties: serversSchema,
    },
  },
};
