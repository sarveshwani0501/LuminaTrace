

const uuidSchema = { type: "string", format: "uuid" };

export const createRuleSchema = {
  querystring: {
    type: "object",
    required: ["projectId"],
    properties: {
      projectId: { type: "string", format: "uuid" },
    },
  },
  body: {
    type: "object",
    required: ["metricName", "threshold", "condition"],
    properties: {
      metricName: {
        type: "string",
      },
      threshold: {
        type: "number",
      },
      condition: {
        type: "string",
      },
      email: {
        type: "string",
        format: "email",
      },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        id: uuidSchema,
        project_id: uuidSchema,
        metric_name: { type: "string" },
        condition: { type: "string" },
        threshold: { type: "number" },
        notification_email: { type: "string" },
        is_active: { type: "boolean" },
        created_at: { type: "string" },
      },
    },
  },
};

export const getAllRulesSchema = {
  querystring: {
    type: "object",
    required: ["projectId"],
    properties: {
      projectId: { type: "string", format: "uuid" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        rules: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: uuidSchema,
              project_id: uuidSchema,
              metric_name: {
                type: "string",
              },
              condition: {
                type: "string",
              },
              threshold: {
                type: "number",
              },
              notification_email: {
                type: "string",
              },
              is_active: {
                type: "boolean",
              },
              created_at: {
                type: "string",
              },
            },
          },
        },
      },
    },
  },
};

export const getRuleByIdSchema = {
  querystring: {
    type: "object",
    required: ["projectId"],
    properties: {
      projectId: { type: "string", format: "uuid" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        id: uuidSchema,
        project_id: uuidSchema,
        metric_name: {
          type: "string",
        },
        condition: {
          type: "string",
        },
        threshold: {
          type: "number",
        },
        notification_email: {
          type: "string",
        },
        is_active: {
          type: "boolean",
        },
        created_at: {
          type: "string",
        },
      },
    },
  },
};

export const updateRuleSchema = {
  querystring: {
    type: "object",
    required: ["projectId"],
    properties: {
      projectId: { type: "string", format: "uuid" },
    },
  },
  body: {
    type: "object",
    properties: {
      threshold: {
        type: "number",
      },
      email: {
        type: "string",
      },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        id: uuidSchema,
        project_id: uuidSchema,
        metric_name: { type: "string" },
        condition: { type: "string" },
        threshold: { type: "number" },
        notification_email: { type: "string" },
        is_active: { type: "boolean" },
        created_at: { type: "string" },
      },
    },
  },
};

export const deleteRuleSchema = {
  querystring: {
    type: "object",
    required: ["projectId"],
    properties: {
      projectId: { type: "string", format: "uuid" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: {
          type: "string",
        },
      },
    },
  },
};

export const toggleStatusSchema = {
  querystring: {
    type: "object",
    required: ["projectId"],
    properties: {
      projectId: { type: "string", format: "uuid" },
    },
  },
  queryString: {
    type: "object",

    properties: {},
  },
  body: {
    type: "object",
    required: ["isActive"],
    properties: {
      isActive: { type: "boolean" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
        isActive: { type: "boolean" },
      },
    },
  },
};

export const getAllEventsSchema = {
  querystring: {
    type: "object",
    required: ["projectId"],
    properties: {
      projectId: uuidSchema,
      serverId: uuidSchema,   
      status: { type: "string" },
      limit: { type: "string" },
      offset: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        events: {
          type: "array",
          items: {
            type: "object",
            properties: {
              event_id: uuidSchema,
              rule_id: uuidSchema,
              server_id: uuidSchema,
              triggered_at: { type: "string" },
              resolved_at: { type: "string" },
              triggered_value: { type: "number" },
              status: { type: "string" },
              notification_sent_at: { type: "string" },
              metric_name: { type: "string" },
              condition: { type: "string" },
              threshold: { type: "number" },
              notification_email: { type: "string" },
              server_name: { type: "string" },
              server_hostname: { type: "string" },
              server_environment: { type: "string" },
            },
          },
        },
      },
    },
  },
};
