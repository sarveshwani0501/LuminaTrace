import { pool } from "../../config/database.js";

export async function findServerById({ serverId }) {
  const res = await pool.query(
    `SELECT id, hostname FROM servers WHERE id = $1`,
    [serverId],
  );

  return res.rows[0];
}

export async function findServerByHostName({ projectId, hostname }) {
  const res = await pool.query(
    `SELECT id FROM servers WHERE project_id = $1 AND hostname = $2`,
    [projectId, hostname],
  );

  return res.rows[0];
}

export async function getServerByProject(projectId) {
  const res = await pool.query(
    `SELECT * FROM servers WHERE project_id = $1 ORDER BY created_at DESC`,
    [projectId],
  );

  return res.rows;
}

export async function getServerById(serverId, projectId) {
  const res = await pool.query(
    `SELECT id, project_id, name, hostname, ip_address, environment, tags, status, last_seen_at as last_heartbeat_at, created_at  FROM servers WHERE id = $1 AND project_id = $2 LIMIT 1`,
    [serverId, projectId],
  );
  return res.rows[0];
}

// CREATE TABLE servers (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
//     name VARCHAR(100) NOT NULL,
//     hostname VARCHAR(255),
//     ip_address INET,
//     environment VARCHAR(20) DEFAULT 'production',
//     tags JSONB DEFAULT '{}',
//     status VARCHAR(20) DEFAULT 'unknown',
//     last_seen_at TIMESTAMPTZ,
//     created_at TIMESTAMPTZ DEFAULT NOW()
// );

export async function createServer({ projectId, hostname }) {
  const res = await pool.query(
    `INSERT INTO servers (project_id, name, hostname) VALUES ($1, $2, $3) RETURNING id`,
    [projectId, hostname, hostname],
  );
  return res.rows[0].id;
}

export async function getStaleServers(threshold) {
  // stale servers to be found
  // so those servers which sent a heartbeat before the threshold time interval
  // and are currently marked as 'online' or 'unknown'
  const res = await pool.query(
    `SELECT * FROM servers WHERE last_seen_at < NOW() - $1::INTERVAL AND status != 'offline'`,
    [threshold],
  );
  return res.rows;
}

export async function markServerOnline(serverId) {
  const res = await pool.query(
    `UPDATE servers SET status = 'online' WHERE id = $1 RETURNING *`,
    [serverId],
  );

  return res.rows[0];
}

export async function markServerOffline(serverId) {
  const res = await pool.query(
    `UPDATE servers SET status = 'offline' WHERE id = $1 RETURNING *`,
    [serverId],
  );

  return res.rows[0];
}
