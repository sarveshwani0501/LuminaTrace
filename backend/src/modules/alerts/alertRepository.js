import { pool } from "../../config/database.js";

// POST   /projects/:projectId/alerts        → Create a rule
// GET    /projects/:projectId/alerts        → List all rules
// GET    /projects/:projectId/alerts/:id    → Get one rule
// PATCH    /projects/:projectId/alerts/:id    → Update a rule
// DELETE /projects/:projectId/alerts/:id    → Delete a rule
// PATCH  /projects/:projectId/alerts/:id/toggle -> Toggle activeness of rule
// GET /projects/:projectId/alerts/:id/events  → List all times this alert fired

// CREATE TABLE alert_rules (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
//     metric_name VARCHAR(50) NOT NULL,
//     condition VARCHAR(10) NOT NULL,
//     threshold DOUBLE PRECISION NOT NULL,
//     notification_email VARCHAR(255) NOT NULL,
//     is_active BOOLEAN DEFAULT TRUE,
//     created_at TIMESTAMPTZ DEFAULT NOW()
// );

export async function createAlertRule(
  projectId,
  metricName,
  condition,
  threshold,
  email,
) {
  const res = await pool.query(
    `INSERT INTO alert_rules (project_id, metric_name, condition, threshold, notification_email)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [projectId, metricName, condition, threshold, email],
  );
  return res.rows[0];
}

export async function getAllRules(projectId) {
  const res = await pool.query(
    `SELECT * FROM alert_rules WHERE project_id = $1`,
    [projectId],
  );

  return res.rows;
}

export async function getRuleById(id, projectId) {
  const res = await pool.query(
    `SELECT * FROM alert_rules WHERE id = $1 AND project_id = $2`,
    [id, projectId],
  );

  return res.rows[0];
}

export async function updateRuleById(id, projectId, threshold, email) {
  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  if (threshold !== undefined && threshold !== null) {
    setClauses.push(`threshold = $${paramIndex++}`);
    values.push(threshold);
  }

  if (email !== undefined && email !== null) {
    setClauses.push(`notification_email = $${paramIndex++}`);
    values.push(email);
  }

  if (setClauses.length === 0) {
    return await getRuleById(id, projectId);
  }

  values.push(id, projectId);
  const query = `
    UPDATE alert_rules 
    SET ${setClauses.join(", ")} 
    WHERE id = $${paramIndex++} AND project_id = $${paramIndex} 
    RETURNING *
  `;

  const res = await pool.query(query, values);
  return res.rows[0];
}

// deleting a rule

export async function deleteRuleById(id, projectId) {
  const res = await pool.query(
    `DELETE FROM alert_rules WHERE id = $1 AND project_id = $2 RETURNING *`,
    [id, projectId],
  );

  return res.rows[0];
}

export async function toggleRuleActive(projectId, ruleId, isActive) {
  const res = await pool.query(
    `UPDATE alert_rules SET is_active = $1 WHERE id = $2 AND project_id = $3 RETURNING *`,
    [isActive, ruleId, projectId],
  );
  return res.rows[0];
}

// Worker Operations (Automatic):
//   getActiveRules()       - Find rules to check
//   getActiveEvent()       - Check if already firing
//   createAlertEvent()     - Record that alert fired
//   resolveEvent()         - Mark alert as resolved

// History/Reporting (Dashboard):
//   getAlertEventsByRule() - Show history for one rule
//   getEventsByProjectId() - Show all events for project

export async function getActiveRules(projectId, metricName) {
  const res = await pool.query(
    `SELECT * FROM alert_rules WHERE project_id = $1 AND metric_name = $2 AND is_active = true`,
    [projectId, metricName],
  );

  return res.rows;
}

export async function getActiveEvent(ruleId, serverId) {
  const res = await pool.query(
    `SELECT * FROM alert_events WHERE alert_rule_id = $1 AND server_id = $2 AND status = 'firing' AND resolved_at IS NULL`,
    [ruleId, serverId],
  );

  return res.rows[0];
}

export async function createAlertEvent(ruleId, serverId, triggeredValue) {
  const res = await pool.query(
    `INSERT INTO alert_events (alert_rule_id, server_id, triggered_value, status, notification_sent_at) VALUES ($1, $2, $3, 'firing', NOW()) RETURNING *`,
    [ruleId, serverId, triggeredValue],
  );

  return res.rows[0];
}

export async function resolveEvent(ruleId, serverId) {
  const res = await pool.query(
    `UPDATE alert_events SET status = 'resolved', resolved_at = NOW() WHERE alert_rule_id = $1 AND server_id = $2 AND status = 'firing' AND resolved_at IS NULL RETURNING *`,
    [ruleId, serverId],
  );

  return res.rows[0];
}

export async function getAlertEventsByRule(ruleId, limit = 50) {
  const res = await pool.query(
    `SELECT ae.*, s.name AS server_name, s.hostname AS server_hostname, s.environment AS server_environment FROM alert_events ae LEFT JOIN servers s ON ae.server_id = s.id WHERE ae.alert_rule_id = $1 ORDER BY ae.triggered_at DESC LIMIT $2`,
    [ruleId, limit],
  );

  return res.rows;
}

export async function getEventsByProjectId(projectId, filters) {
  const { status, serverId, limit = 100, offset = 0 } = filters;

  let query = `SELECT
    ae.id AS event_id,
    ae.alert_rule_id AS rule_id,
    ae.server_id,
    ae.triggered_at,
    ae.resolved_at,
    ae.triggered_value,
    ae.status,
    ae.notification_sent_at,
    ar.metric_name,
    ar.condition,
    ar.threshold,
    ar.notification_email,
    s.name AS server_name,
    s.hostname AS server_hostname,
    s.environment AS server_environment
    FROM alert_events ae
    JOIN alert_rules ar ON ae.alert_rule_id = ar.id
    LEFT JOIN servers s ON ae.server_id = s.id
    WHERE ar.project_id = $1`;

  const values = [projectId];

  if (status) {
    values.push(status);
    query += ` AND ae.status = $${values.length}`;
  }

  if (serverId) {
    values.push(serverId);
    query += ` AND ae.server_id = $${values.length}`;
  }

  query += ` ORDER BY ae.triggered_at DESC`;

  values.push(limit);
  query += ` LIMIT $${values.length}`;

  values.push(offset);
  query += ` OFFSET $${values.length}`;

  const res = await pool.query(query, values);
  return res.rows;
}
