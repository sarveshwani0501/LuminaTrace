import { pool } from "../../config/database.js";

// ─── USER FUNCTIONS ───────────────────────────────────────────

export async function getUserById(userId) {
  const res = await pool.query(
    `SELECT id, full_name, email, is_email_verified, 
            created_at, last_login_at
     FROM users WHERE id = $1`,
    [userId],
  );
  return res.rows[0];
}

export async function getUserByEmail(email) {
  const res = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return res.rows[0];
}

export async function createUser({ full_name, email, password_hash }) {
  const res = await pool.query(
    `INSERT INTO users (full_name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, full_name, email, created_at`,
    [full_name, email, password_hash],
  );
  return res.rows[0];
}

export async function updateLastLogin(userId) {
  await pool.query(`UPDATE users SET last_login_at = NOW() WHERE id = $1`, [
    userId,
  ]);
}

// ─── ORGANIZATION FUNCTIONS ───────────────────────────────────

export async function createOrganization({ name, slug }) {
  const res = await pool.query(
    `INSERT INTO organizations (name, slug)
     VALUES ($1, $2)
     RETURNING id, name, slug, plan, created_at`,
    [name, slug],
  );
  return res.rows[0];
}

export async function getUserOrganizations(userId) {
  const res = await pool.query(
    `SELECT 
      org.id,
      org.name,
      org.slug,
      org.plan,
      om.role,
      om.joined_at
     FROM organizations org
     JOIN organization_members om ON org.id = om.organization_id
     WHERE om.user_id = $1
     ORDER BY om.joined_at DESC`,
    [userId],
  );
  return res.rows;
}

// ─── MEMBERSHIP FUNCTIONS ─────────────────────────────────────

export async function addMember({ userId, organizationId, role }) {
  const res = await pool.query(
    `INSERT INTO organization_members (user_id, organization_id, role)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, organizationId, role],
  );
  return res.rows[0];
}

// ─── INVITE FUNCTIONS ─────────────────────────────────────────

export async function createInvite({
  organizationId,
  email,
  token,
  role,
  invitedBy,
  expiresAt,
}) {
  const res = await pool.query(
    `INSERT INTO org_invites
      (organization_id, email, token, role, invited_by, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [organizationId, email, token, role, invitedBy, expiresAt],
  );
  return res.rows[0];
}

export async function getInviteByToken(token) {
  const res = await pool.query(
    `SELECT
      inv.*,
      org.name  AS organization_name,
      org.slug  AS organization_slug
     FROM org_invites inv
     JOIN organizations org ON inv.organization_id = org.id
     WHERE inv.token = $1
       AND inv.accepted_at IS NULL
       AND inv.expires_at > NOW()`,
    [token],
  );
  return res.rows[0];
}

export async function markInviteAccepted(token, client) {
  // Accepts an optional client for use inside transactions
  const db = client || pool;
  await db.query(
    `UPDATE org_invites SET accepted_at = NOW() WHERE token = $1`,
    [token],
  );
}

export async function getOrganizationInvites(organizationId) {
  const res = await pool.query(
    `SELECT id, email, role, invited_by, expires_at, created_at
     FROM org_invites
     WHERE organization_id = $1
       AND accepted_at IS NULL
       AND expires_at > NOW()
     ORDER BY created_at DESC`,
    [organizationId],
  );
  return res.rows;
}
