const uuidSchema = { type: "string", format: "uuid" };

const emailSchema = {
  type: "string",
  format: "email",
};

const passwordSchema = {
  type: "string",
  minLength: 8,
};

const organizationResponseSchema = {
  type: "object",
  properties: {
    id: uuidSchema,
    name: { type: "string" },
    slug: { type: "string" },
    role: { type: "string" },
  },
};

export const signupSchema = {
  body: {
    type: "object",
    required: ["full_name", "email", "password", "organization_name"],
    properties: {
      full_name: {
        type: "string",
      },
      email: emailSchema,
      password: passwordSchema,
      organization_name: {
        type: "string",
      },
    },
  },

  response: {
    201: {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            id: uuidSchema,
            full_name: { type: "string" },
            email: emailSchema,
          },
        },
        organization: organizationResponseSchema,
      },
    },
  },
};

export const loginSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: emailSchema,
      password: passwordSchema,
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
            email: emailSchema,
          },
        },
        organizations: {
          type: "array",
          items: organizationResponseSchema,
        },
      },
    },
  },
};

export const signupViaInviteSchema = {
  body: {
    type: "object",
    required: ["full_name", "email", "password"],
    properties: {
      full_name: { type: "string" },
      email: emailSchema,
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
            email: emailSchema,
          },
        },
        organization: organizationResponseSchema,
      },
    },
  },
};


export const sendEmailVerificationSchema = {
  body: {
    type: "object",
    required: ["email"],
    properties: {
      email: emailSchema,
    },
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

export const verifyEmailSchema = {
  body: {
    type: "object",
    required: ["email", "otp"],
    properties: {
      email: emailSchema,
      otp: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
}
