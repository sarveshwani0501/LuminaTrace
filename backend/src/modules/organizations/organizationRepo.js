// GET  /organizations/:orgId           → get org details
// PUT  /organizations/:orgId           → update org name
// GET  /organizations/:orgId/members   → list all members
// POST /organizations/:orgId/members   → invite a member by email
// DELETE /organizations/:orgId/members/:userId  → remove a member
// users --> id , full_name , email , password_hash , is_email_verified , created_at, last_login_at
// organizations --> id , name, slug , plan , created_at
// organizations_members --> id , user_id , organization_id , role , joined_at
// org_invites -->  id , organization_id , email , token , role , invited_by , accepted_at , expires_at , created_at

import { pool } from "../../config/database.js";

export async function getOrganizationDetails(orgId) {
  const result = await pool.query(`SELECT * FROM organizations WHERE id = $1`, [
    orgId,
  ]);

  return result.rows[0];
}

export async function updateOrganizationName(orgId, { name, slug }) {
  const result = await pool.query(
    `UPDATE organizations SET name = $1, slug = $2 WHERE id = $3 RETURNING *`,
    [name, slug, orgId],
  );

  return result.rows[0];
}

export async function getOrganizationMembers(orgId) {
  const result = await pool.query(
    `SELECT u.id, u.full_name, u.email, om.role, om.joined_at 
     FROM organization_members om 
     JOIN users u ON om.user_id = u.id 
     WHERE om.organization_id = $1 
     ORDER BY om.joined_at`,
    [orgId],
  );
  return result.rows;
}

export async function removeMember(orgId, userId) {
  const result = await pool.query(
    `DELETE FROM organization_members WHERE organization_id = $1 AND user_id = $2 RETURNING *`,
    [orgId, userId],
  );

  return result.rows[0];
}

//

export async function createInvite({
  organization_id,
  email,
  token,
  role,
  invited_by,
  expires_at,
}) {
  const result = await pool.query(
    `INSERT INTO org_invites (organization_id, email, token, role, invited_by, expires_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [organization_id, email, token, role, invited_by, expires_at],
  );

  return result.rows[0];
}

//

export async function getPendingInvites(orgId, email) {
  const result = await pool.query(
    `SELECT id FROM org_invites WHERE organization_id = $1 AND email = $2 AND accepted_at IS NULL AND expires_at > NOW()`,
    [orgId, email],
  );
  return result.rows[0];
}

// getOrganizationInvites

export async function getOrganizationInvites(orgId) {
  const result = await pool.query(
    `SELECT id, email, role, invited_by, expires_at, created_at 
     FROM org_invites 
     WHERE organization_id = $1 AND accepted_at IS NULL AND expires_at > NOW()
     ORDER BY created_at DESC`,
    [orgId],
  );
  return result.rows;
}

// delete invite
export async function deleteInviteRequest(inviteId, organizationId) {
  const result = await pool.query(
    `DELETE FROM org_invites WHERE id = $1 AND organization_id = $2 RETURNING *`,
    [inviteId, organizationId],
  );
  return result.rows[0];
}
