// users --> id , full_name , email , password_hash , is_email_verified , created_at, last_login_at
// organizations --> id , name, slug , plan , created_at
// organizations_members --> id , user_id , organization_id , role , joined_at
// org_invites -->  id , organization_id , email , token , role , invited_by , accepted_at , expires_at , created_at

import { pool } from "../../config/database.js";

export async function getInviteByToken(token) {
  const res = await pool.query(
    `SELECT inv.id, inv.email, inv.role, inv.expires_at, inv.accepted_at, org.id AS organization_id, org.name AS organization_name, org.slug AS organization_slug FROM org_invites inv JOIN organizations org ON inv.organization_id = org.id WHERE inv.token = $1`,
    [token],
  );

  return res.rows[0];
}

export async function checkUserExists(email) {
  const res = await pool.query(`SELECT id FROM users WHERE email = $1`, [
    email,
  ]);
  return res.rows[0] || null;
}

export async function checkAlreadyMember(organizationId, userId) {
  const res = await pool.query(
    `SELECT id FROM organization_members WHERE user_id = $1 AND organization_id = $2`,
    [userId, organizationId],
  );

  return res.rows[0] || null;
}

export async function addMemberToOrg({ userId, organizationId, role }) {
  const res = await pool.query(
    `INSERT INTO organization_members (user_id, organization_id, role) VALUES ($1, $2, $3) RETURNING *`,
    [userId, organizationId, role],
  );
  return res.rows[0];
}

export async function markInviteAccepted(token) {
  const res = await pool.query(
    `UPDATE org_invites SET accepted_at = NOW() WHERE token = $1`,
    [token],
  );
  return res.rows[0];
}


