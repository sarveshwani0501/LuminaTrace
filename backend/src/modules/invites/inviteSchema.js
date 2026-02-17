const uuidSchema = { type: "string", format: "uuid" };

export const getInviteSchema = {
  response: {
    200: {
      type: "object",
      properties: {
        organization_name: { type: "string" },
        organizationSlug: { type: "string" },
        email: { type: "string", format: "email" },
        role: { type: "string", enum: ["owner", "member"] },
        existingUser: { type: "boolean" },
      },
    },
  },
};

export const createNewUserSchema = {
  body: {
    type: "object",
    required: ["full_name", "password"],
    properties: {
      full_name: { type: "string" },
      password: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            id: uuidSchema,
            full_name: { type: "string" },
            email: { type: "string" },
            created_at: { type: "string" },
          },
        },

        organization: {
          type: "object",
          properties: {
            id: uuidSchema,
            name: { type: "string" },
            slug: { type: "string" },
            role: { type: "string" },
          },
        },
      },
    },
  },
};

export const alreadyExistSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string" },
      password: { type: "string" },
    },
  },

  response: {
    200: {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            id: uuidSchema,
            full_name: { type: "string" },
            email: { type: "string" },
            created_at: { type: "string" },
          },
        },

        organization: {
          type: "object",
          properties: {
            id: uuidSchema,
            name: { type: "string" },
            slug: { type: "string" },
            role: { type: "string" },
          },
        },
      },
    },
  },
};
