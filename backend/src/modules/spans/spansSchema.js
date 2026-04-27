export const getSpansByTraceSchema = {
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
      projectId: { type: "string", format: "uuid" },
    },
  },
  response: {
    200: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          parent: { type: ["string", "null"] },
          name: { type: "string" },
          service: { type: "string" },
          offset: { type: "number" },
          duration: { type: "number" },
          level: { type: "string" },
          depth: { type: "number" },
          meta: { type: "string" },
        },
      },
    },
  },
};
