import { pool } from "../../config/database";

// CREATE TABLE monitored_endpoints (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
//     url VARCHAR(500) NOT NULL,
//     check_interval_seconds INTEGER DEFAULT 30,
//     is_active BOOLEAN DEFAULT TRUE,
//     created_at TIMESTAMPTZ DEFAULT NOW()
// );

// -- Uptime checks basically this is the log table logging everytime the url is pinged

// CREATE TABLE uptime_checks (
//     time TIMESTAMPTZ NOT NULL,
//     endpoint_id UUID NOT NULL REFERENCES monitored_endpoints(id) ON DELETE CASCADE,
//     is_up BOOLEAN NOT NULL,
//     status_code INTEGER,
//     response_time_ms DOUBLE PRECISION,
//     error_message TEXT
// );

// SELECT create_hypertable('uptime_checks', 'time');

// CREATE TABLE uptime_incidents (
//     id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
//     endpoint_id      UUID         NOT NULL REFERENCES monitored_endpoints(id) ON DELETE CASCADE,
//     started_at       TIMESTAMPTZ  DEFAULT NOW(),
//     resolved_at      TIMESTAMPTZ,
//     status           VARCHAR(20)  DEFAULT 'open',
//     failure_count    INTEGER      DEFAULT 1,
//     last_error       TEXT
// );

export async function createEndpoint(projectId, data) {
  const { url, checkIntervalSeconds } = data;

  const res = await pool.query(
    `INSERT INTO monitored_endpoints (project_id, url, check_interval_seconds) VALUES ($1, $2, $3) RETURNING *`,
    [projectId, url, checkIntervalSeconds],
  );

  return res.rows[0];
}

export async function getAllEndpoints(projectId) {
  const res = await pool.query(
    `SELECT * FROM monitored_endpoints WHERE project_id = $1 AND is_active = true`,
    [projectId],
  );

  return res.rows;
}

export async function getEndpointById(id) {
  const res = await pool.query(
    `SELECT * FROM monitored_endpoints WHERE id = $1`,
    [id],
  );
  return res.rows[0];
}

export async function updateEndpoint(id, data) {
  const { url, checkIntervalSeconds, isActive } = data;
  let updateClause = [];
  let values = [];

  if (url) {
    values.push(url);
    updateClause.push(`url = $${values.length}`);
  }
  if (checkIntervalSeconds) {
    values.push(checkIntervalSeconds);
    updateClause.push(`check_interval_seconds = $${values.length}`);
  }
  if (isActive != null) {
    values.push(isActive);
    updateClause.push(`is_active = $${values.length}`);
  }

  if (updateClause.length === 0) return getEndpointById(id);

  values.push(id);

  let query = `UPDATE monitored_endpoints SET `;
  query += updateClause.join(", ");
  query += ` WHERE id = $${values.length} RETURNING *`;

  const res = await pool.query(query, values);

  return res.rows[0];
}

// DELETE ENDPOINT

export async function deleteEndpointById(id) {
  const res = await pool.query(
    `DELETE FROM monitored_endpoints WHERE id = $1 RETURNING *`,
    [id],
  );
  return res.rows[0];
}

export async function getRecentChecks(endpointId, limit = 50) {
  const res = await pool.query(
    `SELECT * FROM uptime_checks 
     WHERE endpoint_id = $1 
     AND time > NOW() - INTERVAL '15 minutes' 
     ORDER BY time DESC 
     LIMIT $2`,
    [endpointId, limit],
  );
  return res.rows;
}

export async function getIncidents(endpointId, limit = 50) {
  const res = await pool.query(
    `SELECT * FROM uptime_incidents WHERE endpoint_id = $1 ORDER BY started_at DESC LIMIT $2`,
    [endpointId, limit],
  );
  return res.rows;
}

export async function calculateUptime(endpointId, period = "24 hours") {
  const res = await pool.query(
    `SELECT 
       COUNT(*) AS total_checks,
       COUNT(*) FILTER (WHERE is_up = true) AS successful_checks,
       CASE 
         WHEN COUNT(*) = 0 THEN 100.00
         ELSE ROUND((COUNT(*) FILTER (WHERE is_up = true) * 100.0 / COUNT(*))::numeric, 2)
       END AS uptime_percentage
     FROM uptime_checks 
     WHERE endpoint_id = $1 
       AND time >= NOW() - $2::interval`,
    [endpointId, period],
  );

  const data = res.rows[0];
  return {
    uptimePercentage: parseFloat(data.uptime_percentage),
    totalChecks: parseInt(data.total_checks, 10),
    successfulChecks: parseInt(data.successful_checks, 10),
  };
}

// Repository functions needed for background tasks

export async function getAllActiveEndpoints(projectId) {
  const res = await pool.query(
    `SELECT * FROM monitored_endpoints WHERE project_id = $1 AND is_active = true`,
    [projectId],
  );
}

export async function recordCheck(endpointId, result) {
  const { isUp, statusCode, responseTime, errorMessage } = result;
  const res = await pool.query(
    `INSERT INTO uptime_checks (time, endpoint_id, is_up, status_code, response_time_ms, error_message) VALUES (NOW(), $1, $2, $3, $4, $5) RETURNING *`,
    [endpointId, isUp, statusCode, responseTime, errorMessage],
  );

  return res.rows[0];
}

export async function getActiveIncident(endpointId) {
  const res = await pool.query(
    `SELECT * FROM uptime_incidents WHERE endpoint_id = $1 AND status = 'open'`,
  );
  return res.rows[0];
}

// CREATE TABLE uptime_incidents (
//     id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
//     endpoint_id      UUID         NOT NULL REFERENCES monitored_endpoints(id) ON DELETE CASCADE,
//     started_at       TIMESTAMPTZ  DEFAULT NOW(),
//     resolved_at      TIMESTAMPTZ,
//     status           VARCHAR(20)  DEFAULT 'open',
//     failure_count    INTEGER      DEFAULT 1,
//     last_error       TEXT
// );

export async function createIncident(endpointId, error) {
  const res = await pool.query(
    `INSERT INTO uptime_incidents (endpoint_id, error) VALUES ($1, $2) RETURNING *`,
    [endpointId, error],
  );

  return res.rows[0];
}

export async function resolveIncident(endpointId) {
  const res = await pool.query(
    `UPDATE uptime_incidents SET status = 'resolved', resolved_at = NOW() WHERE endpoint_id = $1 RETURNING *`,
    [endpointId],
  );

  return res.rows[0];
}

export async function incrementFailureCount(incidentId) {
  const res = await pool.query(
    `UPDATE uptime_incidents SET failure_count = failure_count + 1 WHERE incident_id = $1 RETURNING *`,
    [incidentId],
  );
  return res.rows[0];
}

// CREATE TABLE uptime_checks (
//     time TIMESTAMPTZ NOT NULL,
//     endpoint_id UUID NOT NULL REFERENCES monitored_endpoints(id) ON DELETE CASCADE,
//     is_up BOOLEAN NOT NULL,
//     status_code INTEGER,
//     response_time_ms DOUBLE PRECISION,
//     error_message TEXT
// );
