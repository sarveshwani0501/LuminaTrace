import authenticate from "../../middlewares/authenticate.js";
import authorise from "../../middlewares/authorise.js";
import * as orgController from "./organizationController.js";
import {
  orgResSchema,
  addMemberSchema,
  orgSchema,
  orgMembersSchema,
  deleteMemberSchema,
  inviteDeleteSchema,
  pendingInvitesSchema,
  createOrgSchema,
} from "./organizationSchema.js";

// POST /organizations                  → create an organization
// GET  /organizations/:orgId           → get org details
// PUT  /organizations/:orgId           → update org name
// GET  /organizations/:orgId/members   → list all members
// POST /organizations/:orgId/members   → invite a member by email
// DELETE /organizations/:orgId/members/:userId  → remove a member
// GET /organizations/:orgId/invites
// DELETE /organizations/:orgId/invites/:inviteId

export default async function organizationRoutes(fastify) {
  fastify.post(
    "/organizations",
    { schema: createOrgSchema, preHandler: [authenticate] },
    orgController.createOrganization,
  );

  fastify.get(
    "/organizations/:orgId",
    { schema: orgResSchema, preHandler: [authenticate, authorise("member")] },
    orgController.getOrgDetails,
  );

  fastify.put(
    "/organizations/:orgId",
    {
      schema: orgSchema,
      preHandler: [authenticate, authorise("owner")],
    },
    orgController.updateOrg,
  );

  fastify.get(
    "/organizations/:orgId/members",
    {
      schema: orgMembersSchema,
      preHandler: [authenticate, authorise("member")],
    },
    orgController.getOrgMembers,
  );

  fastify.delete(
    "/organizations/:orgId/members/:userId",
    {
      schema: deleteMemberSchema,
      preHandler: [authenticate, authorise("owner")],
    },
    orgController.removeOrgMember,
  );

  fastify.post(
    "/organizations/:orgId/members",
    {
      schema: addMemberSchema,
      preHandler: [authenticate, authorise("owner")],
    },
    orgController.inviteMember,
  );

  fastify.get(
    "/organizations/:orgId/invites",
    {
      schema: pendingInvitesSchema,
      preHandler: [authenticate, authorise("owner")],
    },
    orgController.getAllRequests,
  );

  fastify.delete(
    "/organizations/:orgId/invites/:inviteId",
    {
      schema: inviteDeleteSchema,
      preHandler: [authenticate, authorise("owner")],
    },
    orgController.deleteInviteReq,
  );
}
