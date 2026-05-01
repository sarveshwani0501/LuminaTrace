// GET  /organizations/:orgId           → get org details
// PUT  /organizations/:orgId           → update org name
// GET  /organizations/:orgId/members   → list all members
// POST /organizations/:orgId/members   → invite a member by email
// DELETE /organizations/:orgId/members/:userId  → remove a member
// GET /organizations/:orgId/invites
// DELETE /organizations/:orgId/invites/:inviteId

import * as orgService from "./organizationService.js";

export async function createOrganization(req, reply) {
  const { name } = req.body;
  const userId = req.user.userId;
  const res = await orgService.createNewOrganization(userId, name);
  return reply.code(201).send(res);
}

export async function getOrgDetails(req, reply) {
  const { orgId } = req.params;
  if (!orgId) {
    throw {
      statusCode: 400,
      message: "Organization Id is NULL",
    };
  }

  const res = await orgService.organizationDetails(orgId);
  return reply.code(200).send(res);
}

export async function updateOrg(req, reply) {
  const { orgId } = req.params;
  if (!orgId) {
    throw {
      statusCode: 400,
      message: "Organization Id is NULL",
    };
  }

  const { name } = req.body;
  const res = await orgService.updateOrganizationDetails(orgId, name);
  return reply.code(200).send(res);
}

export async function getOrgMembers(req, reply) {
  const { orgId } = req.params;
  if (!orgId) {
    throw {
      statusCode: 400,
      message: "Organization Id is NULL",
    };
  }
  const members = await orgService.getMembers(orgId);
  return reply.code(200).send({ organizationMembers: members });
}

export async function inviteMember(req, reply) {
  const { orgId } = req.params;
  const { email, role } = req.body;
  if (!orgId) {
    throw {
      statusCode: 400,
      message: "Organization Id is NULL",
    };
  }
  const invitedBy = req.user.userId;
  const res = await orgService.createInvite(orgId, email, role, invitedBy);

  return reply.code(201).send({
    message: "Invite sent",
    inviteLink: res.inviteLink,
  });
}

export async function removeOrgMember(req, reply) {
  const { orgId } = req.params;
  const { userId } = req.params;
  if (!orgId) {
    throw {
      statusCode: 400,
      message: "Organization Id is NULL",
    };
  }
  if (!userId) {
    throw {
      statusCode: 400,
      message: "User Id is NULL",
    };
  }

  const requestedBy = req.user.userId;

  const res = await orgService.removeMember(orgId, userId, requestedBy);

  return reply.code(200).send({
    message: "Member removed successfully",
  });
}

export async function getAllRequests(req, reply) {
  const { orgId } = req.params;

  if (!orgId) {
    throw {
      statusCode: 400,
      message: "Organization Id is NULL",
    };
  }

  const res = await orgService.pendingInvites(orgId);

  return reply.code(200).send(res);
}

export async function deleteInviteReq(req, reply) {
  const { orgId, inviteId } = req.params;
  if (!orgId) {
    throw {
      statusCode: 400,
      message: "Organization Id is NULL",
    };
  }
  if (!inviteId) {
    throw {
      statusCode: 400,
      message: "Invite Id is NULL",
    };
  }

  const res = await orgService.deleteInvite(inviteId, orgId);

  return reply.code(200).send({ message: "Invite Cancelled" });
}
