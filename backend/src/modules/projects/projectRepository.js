// users --> id , full_name , email , password_hash , is_email_verified , created_at, last_login_at
// organizations --> id , name, slug , plan , created_at
// organizations_members --> id , user_id , organization_id , role , joined_at
// org_invites -->  id , organization_id , email , token , role , invited_by , accepted_at , expires_at , created_at
// projects --> id, organization_id, name, slug, description, api_key, api_key_preview, retention_days, created_at, created_by

// GET    /organizations/:orgId/projects         → list all projects -- repo
// POST   /organizations/:orgId/projects         → create a project
// GET    /organizations/:orgId/projects/:projId → get project details + api_key
// PUT    /organizations/:orgId/projects/:projId → update project
// DELETE /organizations/:orgId/projects/:projId → delete project

// POST /organizations/:orgId/projects/:projId/rotate-key

import { pool } from "../../config/database";

export async function getAll(orgId) {
  const res = await pool.query(
    `SELECT id, name, slug, description, retention_days, created_at, created_by FROM projects WHERE organization_id = $1`,
    [orgId],
  );

  return res.rows;
}

export async function doesProjectNameExists(orgId, name) {
  const res = await pool.query(
    `SELECT name FROM projects WHERE name = $1 AND organization_id = $2`,
    [name, orgId],
  );
  return res.rows[0] || null;
}

export async function getProjectById(orgId, projectId) {
  const res = await pool.query(
    `SELECT id, name, slug, description, retention_days, created_at, created_by, api_key_preview FROM projects WHERE id = $1 AND organization_id = $2`,
    [projectId, orgId],
  );
  return res.rows[0];
}

export async function createProject(
  orgId,
  { name, slug, description, created_by, api_key, api_key_preview },
) {
  const res = await pool.query(
    `INSERT INTO projects (organization_id, name, slug, description, api_key, api_key_preview, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [orgId, name, slug, description, api_key, api_key_preview, created_by],
  );

  return res.rows[0];
}

//
export async function updateProjectDetails(projectId, { name, description }) {
  const res1 = await pool.query(`SELECT * FROM projects WHERE id = $1`, [
    projectId,
  ]);

  if (res1.rows.length === 0) {
    return null;
  }

  name = name != null ? name : res1.rows[0].name;
  description = description != null ? description : res1.rows[0].description;

  const res = await pool.query(
    `UPDATE projects SET name = $1, description = $2 WHERE id = $3 RETURNING *`,
    [name, description, projectId],
  );

  return res.rows[0];
}

export async function deleteProject(projectId) {
  const res = await pool.query(
    `DELETE FROM projects WHERE id = $1 RETURNING *`,
    [projectId],
  );
  return res.rows[0];
}

export async function updateAPIKey(projectId, orgId, new_preview, new_hash) {
  const res = await pool.query(
    `UPDATE projects SET api_key = $1, api_key_preview = $2 WHERE id = $3 AND organization_id = $4 RETURNING *`,
    [new_hash, new_preview, projectId, orgId],
  );
  return res.rows[0];
}

// done bhai
