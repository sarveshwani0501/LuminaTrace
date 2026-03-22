import { pool } from "../../config/database.js";
import { compareHash } from "../../utils/hash.js";

export async function validateAPIKey(apiKey) {
  if (!apiKey || !apiKey.startsWith("lt_")) {
    return null;
  }

  const preview = apiKey.substring(0, 12);

  const res = await pool.query(
    `SELECT id, api_key FROM projects WHERE api_key_preview = $1`,
    [preview],
  );

  if (!res.rows || res.rows.length === 0) {
    return null;
  }

  for (const project of res.rows) {
    const isValid = await compareHash(apiKey, project.api_key);
    if (isValid) {
      return project.id;
    }
  }

  return null;
}

export function enrichLog(log, projectId) {
  return {
    projectId: projectId,
    timestamp: log.timestamp,
    serverId: log.serverId || null,
    hostname: log.hostname || null,
    level: log.level,
    message: log.message,
    traceId: log.traceId || null,
    spanId: log.spanId || null,
    metadata: log.metadata || {},
  };
}

export function enrichMetrics(metricData, projectId) {
  return {
    projectId: projectId,
    timestamp: metricData.timestamp,
    name: metricData.name,
    value: metricData.value,
    unit: metricData.unit,
    serverId: metricData.serverId || null,
    hostname: metricData.hostname || null,
    tags: metricData.tags || {},
  };
}

export async function updateServerHeartBeat(projectId, serverData) {
  const { name, hostname, ipAddress, environment, tags } = serverData;
  const sanitizedIpAddress = ipAddress && ipAddress !== "" ? ipAddress : null;
  const existing = await pool.query(
    `SELECT id FROM servers WHERE project_id = $1 AND hostname = $2`,
    [projectId, hostname],
  );

  let serverId;

  if (existing.rows[0]) {
    serverId = existing.rows[0].id;

    await pool.query(
      `UPDATE servers SET last_seen_at = NOW(), ip_address = COALESCE($2, ip_address), name = COALESCE($3, name), environment = COALESCE($4, environment), tags = COALESCE($5, tags), status = 'online' WHERE id = $1`,
      [
        serverId,
        sanitizedIpAddress,
        name,
        environment,
        tags ? JSON.stringify(tags) : null,
      ],
    );
  } else {
    const result = await pool.query(
      `INSERT INTO servers (project_id, hostname, ip_address, name, environment, tags, last_seen_at, status) VALUES ($1, $2, $3, $4, $5, $6, NOW(), 'online') RETURNING id`,
      [
        projectId,
        hostname,
        sanitizedIpAddress || null,
        name || hostname,
        environment || "production",
        tags ? JSON.stringify(tags) : "{}",
      ],
    );

    serverId = result.rows[0].id;
  }

  return serverId;
}
