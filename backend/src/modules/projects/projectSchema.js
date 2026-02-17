const uuidSchema = { type: "string", format: "uuid" };

const projectAllSchema = {
  type: "object",
  properties: {
    id: uuidSchema,
    name: { type: "string" },
    slug: { type: "string" },
    description: { type: "string" },
    retention_days: { type: "number" },
    created_by: uuidSchema,
    created_at: { type: "string" },
  },
};

const projectSchema = {
  type: "object",
  properties: {
    id: uuidSchema,
    name: { type: "string" },
    slug: { type: "string" },
    description: { type: "string" },
    retention_days: { type: "number" },
    created_at: { type: "string" },
    created_by: uuidSchema,
    api_key_preview: { type: "string" },
  },
};

const projectWithFullKeySchema = {
  type: "object",
  properties: {
    id: uuidSchema,
    name: { type: "string" },
    slug: { type: "string" },
    description: { type: "string" },
    retention_days: { type: "number" },
    created_at: { type: "string" },
    created_by: uuidSchema,
    api_key: { type: "string" },
  },
};

const paramsSchema = {
  type: "object",
  properties: {
    orgId: uuidSchema,
    projId: uuidSchema,
  },
  required: ["orgId"],
};

export const getAllProjectSchema = {
  params: paramsSchema,
  response: {
    200: {
      type: "array",
      items: projectAllSchema,
    },
  },
};

export const getProjectInfoSchema = {
  params: {
    type: "object",
    properties: {
      orgId: uuidSchema,
      projId: uuidSchema,
    },
    required: ["orgId", "projId"],
  },
  response: {
    200: projectSchema,
  },
};

export const createProjectSchema = {
  params: paramsSchema,
  body: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string" },
      description: { type: "string" },
    },
  },
  response: {
    201: projectWithFullKeySchema,
  },
};

export const updateProjectSchema = {
  params: {
    type: "object",
    properties: {
      orgId: uuidSchema,
      projId: uuidSchema,
    },
    required: ["orgId", "projId"],
  },
  body: {
    type: "object",
    properties: {
      name: { type: "string" },
      description: { type: "string" },
    },
  },
  response: {
    200: projectSchema,
  },
};

export const deleteProjectSchema = {
  params: {
    type: "object",
    properties: {
      orgId: uuidSchema,
      projId: uuidSchema,
    },
    required: ["orgId", "projId"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};

export const updateAPIKeySchema = {
  params: {
    type: "object",
    properties: {
      orgId: uuidSchema,
      projId: uuidSchema,
    },
    required: ["orgId", "projId"],
  },
  response: {
    200: projectWithFullKeySchema,
  },
};

// export const getAllProjectsSchema =
