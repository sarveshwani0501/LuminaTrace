// GET  /organizations/:orgId           → get org details
// PUT  /organizations/:orgId           → update org name
// GET  /organizations/:orgId/members   → list all members
// POST /organizations/:orgId/members   → invite a member by email
// DELETE /organizations/:orgId/members/:userId  → remove a member
// users --> id , full_name , email , password_hash , is_email_verified , created_at, last_login_at
// organizations --> id , name, slug , plan , created_at
// organizations_members --> id , user_id , organization_id , role , joined_at
// org_invites -->  id , organization_id , email , token , role , invited_by , accepted_at , expires_at , created_at

import crypto from "crypto";
import * as organizationRepo from "./organizationRepo.js";
import { slugify } from "../../utils/slugify.js";
import { sendEmail } from "../../utils/emailService.js";
import { pool } from "../../config/database.js";
import config from "../../config/index.js";

export async function createNewOrganization(userId, orgName) {
  const slug = slugify(orgName);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    const orgRes = await client.query(
      `INSERT INTO organizations (name, slug) VALUES ($1, $2) RETURNING id, name, slug, plan, created_at`,
      [orgName, slug]
    );
    const org = orgRes.rows[0];

    await client.query(
      `INSERT INTO organization_members (user_id, organization_id, role) VALUES ($1, $2, $3)`,
      [userId, org.id, "owner"]
    );

    await client.query("COMMIT");
    return {
      ...org,
      role: "owner"
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function organizationDetails(orgId) {
  const org = await organizationRepo.getOrganizationDetails(orgId);
  if (!org) {
    throw {
      statusCode: 404,
      message: "Organization not found",
    };
  }
  return org;
}

export async function updateOrganizationDetails(orgId, orgName) {
  const slug = slugify(orgName);
  const org = await organizationRepo.updateOrganizationName(orgId, {
    name: orgName,
    slug,
  });

  if (!org) {
    throw {
      statusCode: 404,
      message: "Organization not found",
    };
  }

  return org;
}

export async function removeMember(orgId, userId, requestedBy) {
  if (requestedBy === userId) {
    throw {
      statusCode: 400,
      message: "Cannot remove yourself, need to transfer ownership",
    };
  }

  const deleted = await organizationRepo.removeMember(orgId, userId);

  if (!deleted) {
    throw {
      statusCode: 404,
      message: "Member not found in this organization",
    };
  }

  return deleted;
}

export async function getMembers(orgId) {
  const members = await organizationRepo.getOrganizationMembers(orgId);
  if (members.length === 0) {
    throw {
      statusCode: 404,
      message: "No members found for this organization",
    };
  }
  return members;
}

export async function createInvite(orgId, email, role, invitedBy) {
  const alreadyExist = await organizationRepo.getPendingInvites(orgId, email);

  if (alreadyExist) {
    throw {
      statusCode: 409,
      message: "Invite has already been sent to this email",
    };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // for 7 days

  const invite = await organizationRepo.createInvite({
    organization_id: orgId,
    email,
    token,
    role: role || "member",
    invited_by: invitedBy,
    expires_at: expiresAt,
  });

  const inviteLink = `${config.app_url.frontend}/signup/invite/${token}`;

  try {
    await sendEmail({
      to: email,
      subject: "You've been invited to join an organization on LuminaTrace",
      html: `
        <h2>LuminaTrace Invitation</h2>
        <p>You have been invited to join an organization on LuminaTrace.</p>
        <p>Please click the link below to accept the invitation and join the organization:</p>
        <a href="${inviteLink}">${inviteLink}</a>
        <p>This invite will expire in 7 days.</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send invite email", error);
    // Non-fatal: invite record is already created, user can be re-invited
  }

  return { invite, inviteLink };
}

export async function pendingInvites(orgId) {
  const pendingInvites = await organizationRepo.getOrganizationInvites(orgId);
  return pendingInvites;
}

export async function deleteInvite(inviteId, orgId) {
  const deletedInvite = await organizationRepo.deleteInviteRequest(
    inviteId,
    orgId,
  );

  if (!deletedInvite) {
    throw {
      statusCode: 404,
      message: "Invite request not found",
    };
  }
  return deletedInvite;
}
