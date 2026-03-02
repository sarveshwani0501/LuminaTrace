import { pool } from "../../config/database.js";
import { getListItems, getHash } from "../../config/redis.js";
// CREATE TABLE logs (
//     time TIMESTAMPTZ NOT NULL,
//     project_id UUID NOT NULL REFERENCES projects(id),
//     server_id UUID REFERENCES servers(id),
//     level VARCHAR(10) NOT NULL,
//     message TEXT NOT NULL,
//     trace_id UUID,
//     span_id UUID,
//     metadata JSONB DEFAULT '{}'
// );

export async function insertLog(log) {
  await pool.query(
    `INSERT INTO logs (time, project_id, server_id, level, message, trace_id, span_id, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      log.timestamp,
      log.projectId,
      log.serverId,
      log.level,
      log.message,
      log.traceId,
      log.spanId,
      log.metadata ? JSON.stringify(log.metadata) : "{}",
    ],
  );
}

export async function insertLogBatch(logs) {
  if (logs.length === 0) return;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const log of logs) {
      await client.query(
        `INSERT INTO logs (time, project_id, server_id, level, message, trace_id, span_id, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          log.timestamp,
          log.projectId,
          log.serverId,
          log.level,
          log.message,
          log.traceId,
          log.spanId,
          log.metadata ? JSON.stringify(log.metadata) : "{}",
        ],
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// GET  /logs?projectId=X&from=...&to=...&level=ERROR&serverId=Y&limit=100&offset=0
// GET  /logs/recent?projectId=X&limit=100
// GET  /logs/stats?projectId=X
// GET  /logs/routes?projectId=X&window=1h

export async function getLogs(projectId, filters = {}) {
  try {
    const { from, to, level, serverId, limit = 100, offset = 0 } = filters;

    let query = `SELECT * FROM logs WHERE project_id = $1`;
    const values = [projectId];

    if (from) {
      values.push(from);
      query += ` AND time >= $${values.length}`;
    }

    if (to) {
      values.push(to);
      query += ` AND time <= $${values.length}`;
    }

    if (level) {
      values.push(level);
      query += ` AND level = $${values.length}`;
    }

    if (serverId) {
      values.push(serverId);
      query += ` AND server_id = $${values.length}`;
    }

    query += ` ORDER BY time DESC`;

    values.push(limit);
    query += ` LIMIT $${values.length}`;

    values.push(offset);
    query += ` OFFSET $${values.length}`;

    const res = await pool.query(query, values);

    return res.rows || [];
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw new Error(`Failed to fetch logs: ${error.message}`);
  }
}

export async function getLogCount(projectId, filters = {}) {
  try {
    const { from, to, level, serverId } = filters;
    let query = `SELECT COUNT(*) as count FROM logs WHERE project_id = $1`;
    const values = [projectId];

    if (from) {
      values.push(from);
      query += ` AND time >= $${values.length}`;
    }

    if (to) {
      values.push(to);
      query += ` AND time <= $${values.length}`;
    }

    if (level) {
      values.push(level);
      query += ` AND level = $${values.length}`;
    }

    if (serverId) {
      values.push(serverId);
      query += ` AND server_id = $${values.length}`;
    }

    const res = await pool.query(query, values);

    if (res.rows && res.rows.length > 0) {
      return parseInt(res.rows[0].count, 10);
    }
    return 0;
  } catch (error) {
    console.error("Error getting log count:", error);
    return 0;
  }
}

export async function getRecentLogsFromRedis(projectId, limit = 100) {
  try {
    const key = `recent_logs:${projectId}`;
    const items = await getListItems(key, 0, limit - 1);

    if (!items || items.length === 0) {
      return [];
    }

    const parsedLogs = [];
    for (const item of items) {
      try {
        const log = JSON.parse(item);
        parsedLogs.push(log);
      } catch (err) {
        console.error("Failed to parse log item:", err);
      }
    }

    return parsedLogs;
  } catch (error) {
    console.error("Error fetching recent logs from Redis:", error);
    return [];
  }
}

export async function getStatsFromRedis(projectId) {
  try {
    const key = `stats:${projectId}:today`;
    const stats = await getHash(key);

    if (!stats) {
      return {
        total_requests: 0,
        error_count: 0,
        warn_count: 0,
        latency_sum: 0,
        latency_count: 0,
      };
    }

    return {
      total_requests: parseInt(stats.total_requests || 0, 10),
      error_count: parseInt(stats.error_count || 0, 10),
      warn_count: parseInt(stats.warn_count || 0, 10),
      latency_sum: parseFloat(stats.latency_sum || 0),
      latency_count: parseInt(stats.latency_count || 0, 10),
    };
  } catch (error) {
    console.error("Error fetching stats from Redis:", error);
    return {
      total_requests: 0,
      error_count: 0,
      warn_count: 0,
      latency_sum: 0,
      latency_count: 0,
    };
  }
}

export async function getTopRoutes(
  projectId,
  from,
  to,
  limit,
  sortBy = "count",
) {
  try {
    const validSorts = {
      count: "request_count",
      errors: "error_count",
      error_rate: "error_rate",
    };

    const orderBy = validSorts[sortBy] || "request_count";

    const query = `
  SELECT
  metadata->>'route' AS route,
  metadata->>'method' AS method,
  COUNT(*) AS request_count,
  COUNT(*) FILTER (WHERE level = 'ERROR') AS error_count,
  (COUNT(*) FILTER (WHERE level = 'ERROR')::float / COUNT(*)::float * 100) as error_rate 
  FROM logs
  WHERE project_id = $1
   AND metadata->>'route' IS NOT NULL
   AND time >= $2
   AND time <= $3
  GROUP BY route, method
  ORDER BY ${orderBy} DESC
  LIMIT $4
  `;

    const res = await pool.query(query, [projectId, from, to, limit]);
    return res.rows || [];
  } catch (error) {
    console.error("Error fetching top routes:", error);
    throw new Error(`Failed to fetch top routes: ${error.message}`);
  }
}

export async function getLogVolumeOverTime(projectId, interval, from, to) {
  try {
    if (!interval) {
      throw new Error("Interval is required for log volume query");
    }

    const query = `SELECT time_bucket($1, time) AS time_bucket,
  COUNT(*) AS log_count
  FROM logs
  WHERE project_id = $2
  AND time >= $3
  AND time <= $4
  GROUP BY time_bucket
  ORDER BY time_bucket DESC`;

    const res = await pool.query(query, [interval, projectId, from, to]);
    return res.rows || [];
  } catch (error) {
    console.error("Error fetching log volume over time:", error);
    throw new Error(`Failed to fetch log volume: ${error.message}`);
  }
}

export async function getErrorRateOverTime(projectId, interval, from, to) {
  try {
    if (!interval) {
      throw new Error("Interval is required for error rate query");
    }

    const query = `
  SELECT 
    time_bucket($1, time) AS bucket,
    COUNT(*) as total_logs,
    COUNT(*) FILTER (WHERE level = 'ERROR') as error_count,
    (COUNT(*) FILTER (WHERE level = 'ERROR')::float / NULLIF(COUNT(*), 0)::float * 100) as error_rate
  FROM logs
  WHERE project_id = $2
    AND time >= $3
    AND time <= $4
  GROUP BY bucket
  ORDER BY bucket ASC
  `;

    const res = await pool.query(query, [interval, projectId, from, to]);
    return res.rows || [];
  } catch (error) {
    console.error("Error fetching error rate over time:", error);
    throw new Error(`Failed to fetch error rate: ${error.message}`);
  }
}
