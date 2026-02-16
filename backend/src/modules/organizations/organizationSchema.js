// GET  /organizations/:orgId           → get org details
// PUT  /organizations/:orgId           → update org name
// GET  /organizations/:orgId/members   → list all members
// POST /organizations/:orgId/members   → invite a member by email
// DELETE /organizations/:orgId/members/:userId  → remove a member

// schema for PUT /organizations/:orgId
const orgSchema = {
  body: {
    type: "object",
    required: ["organization_name"],
    properties: {
      organization_name: { type: "string" },
    },
  },
  response: {
    201
  }
};
