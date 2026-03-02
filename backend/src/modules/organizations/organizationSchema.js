const uuidSchema = { type: "string", format: "uuid" };

const membersSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    full_name: { type: "string" },
    email: { type: "string" },
    role: { type: "string" },
    joined_at: { type: "string" },
  },
};

const organizationSchema = {
  type: "object",
  properties: {
    id: uuidSchema,
    name: { type: "string" },
    slug: { type: "string" },
    plan: { type: "string" },
    created_at: { type: "string" },
  },
};

// response schema for GET /organizations/:orgId

const orgResSchema = {
  response: {
    200: organizationSchema,
  },
};

// schema for PUT /organizations/:orgId
const orgSchema = {
  body: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string" },
    },
  },
  response: {
    200: organizationSchema,
  },
};

// schema for GET /organizations/:orgId/members

const orgMembersSchema = {
  response: {
    200: {
      type: "object",
      properties: {
        organizationMembers: {
          type: "array",
          items: membersSchema,
        },
      },
    },
  },
};

// schema for POST /organizations/:orgId/members
const addMemberSchema = {
  body: {
    type: "object",
    required: ["email", "role"],
    properties: {
      email: { type: "string", format: "email" },
      role: { type: "string", enum: ["owner", "member"] },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        message: { type: "string" },
        inviteLink: { type: "string" },
      },
    },
  },
};

// schema for DELETE /organizations/:orgId/members/:userId
const deleteMemberSchema = {
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};

// schema for GET /organizations/:orgId/invites

const pendingInvitesSchema = {
  response: {
    200: {
      type: "array",
      items: {
        properties: {
          id: uuidSchema,
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["owner", "member"] },
          invited_by: uuidSchema,
          invited_by_name: { type: "string" },
          invited_by_email: { type: "string" },
          expires_at: { type: "string" },
          created_at: { type: "string" },
        },
      },
    },
  },
};

// schema for DELETE /organizations/:orgId/invites/:inviteId

const inviteDeleteSchema = {
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};

export {
  orgResSchema,
  orgSchema,
  orgMembersSchema,
  addMemberSchema,
  deleteMemberSchema,
  pendingInvitesSchema,
  inviteDeleteSchema,
};
