import { pool } from "../../config/database.js";
import { getHash } from "../../config/redis.js";
// CREATE TABLE metrics (
//     time TIMESTAMPTZ NOT NULL,
//     project_id UUID NOT NULL REFERENCES projects(id),
//     server_id UUID REFERENCES servers(id),
//     metric_name VARCHAR(50) NOT NULL,
//     value DOUBLE PRECISION NOT NULL,
//     unit VARCHAR(20),
//     tags JSONB DEFAULT '{}'
// );

export async function insertMetric(metric) {
  await pool.query(
    `INSERT INTO metrics (time, project_id, server_id, metric_name, value, unit, tags) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      metric.timestamp,
      metric.projectId,
      metric.serverId,
      metric.name,
      metric.value,
      metric.unit,
      metric.tags ? JSON.stringify(metric.tags) : "{}",
    ],
  );
}

export async function insertMetricBatch(metrics) {
  if (metrics.length === 0) return;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const metric of metrics) {
      await client.query(
        `INSERT INTO metrics (time, project_id, server_id, metric_name, value, unit, tags) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          metric.timestamp,
          metric.projectId,
          metric.serverId,
          metric.name,
          metric.value,
          metric.unit,
          metric.tags ? JSON.stringify(metric.tags) : "{}",
        ],
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error inserting metric batch:", err);
    throw err;
  } finally {
    client.release();
  }
}

// GET  /metrics/timeseries?projectId=X&metricName=cpu_usage&timerange=6h&serverId=Y (optional)
// GET  /metrics/latest?projectId=X&serverId=Y (optional)

export async function getMetricTimeSeries(
  projectId,
  metricName,
  interval,
  from,
  to,
  serverId = null,
) {
  try {
    if (!interval) {
      throw new Error("Interval is required for metrics query");
    }

    let query;
    let params;

    if (serverId) {
      query = `
        SELECT 
          time_bucket($1, m.time) AS bucket,
          AVG(m.value) AS avg_value,
          MIN(m.value) AS min_value,
          MAX(m.value) AS max_value,
          COUNT(*) AS data_points,
          m.metric_name AS name,
          m.unit,
          m.server_id,
          s.name AS server_name,
          s.hostname AS server_hostname,
          s.environment AS server_environment
        FROM metrics m
        LEFT JOIN servers s ON m.server_id = s.id
        WHERE m.project_id = $2
          AND m.time >= $3
          AND m.time <= $4
          AND m.metric_name = $5
          AND m.server_id = $6
        GROUP BY bucket, m.metric_name, m.unit, m.server_id, s.name, s.hostname, s.environment
        ORDER BY bucket DESC`;
      params = [interval, projectId, from, to, metricName, serverId];
    } else {
      query = `
        SELECT 
          time_bucket($1, m.time) AS bucket,
          AVG(m.value) AS avg_value,
          MIN(m.value) AS min_value,
          MAX(m.value) AS max_value,
          COUNT(*) AS data_points,
          m.metric_name AS name,
          m.unit
        FROM metrics m
        WHERE m.project_id = $2
          AND m.time >= $3
          AND m.time <= $4
          AND m.metric_name = $5
        GROUP BY bucket, m.metric_name, m.unit
        ORDER BY bucket DESC`;
      params = [interval, projectId, from, to, metricName];
    }

    const res = await pool.query(query, params);
    return res.rows || [];
  } catch (error) {
    console.error("Error fetching metrics time-series:", error);
    throw new Error(`Failed to fetch metrics: ${error.message}`);
  }
}

export async function getMetricTimeSeriesP99(
  projectId,
  metricName,
  interval,
  from,
  to,
  serverId = null,
) {
  try {
    if (!interval) {
      throw new Error("Interval is required for metrics query");
    }

    let query;
    let params;

    if (serverId) {
      query = `
        SELECT 
          time_bucket($1, m.time) AS bucket,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY m.value) AS p99_value,
          m.metric_name AS name,
          m.unit,
          m.server_id,
          s.name AS server_name,
          s.hostname AS server_hostname,
          s.environment AS server_environment
        FROM metrics m
        LEFT JOIN servers s ON m.server_id = s.id
        WHERE m.project_id = $2
          AND m.time >= $3
          AND m.time <= $4
          AND m.metric_name = $5
          AND m.server_id = $6
        GROUP BY bucket, m.metric_name, m.unit, m.server_id, s.name, s.hostname, s.environment
        ORDER BY bucket DESC`;
      params = [interval, projectId, from, to, metricName, serverId];
    } else {
      query = `
        SELECT 
          time_bucket($1, m.time) AS bucket,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY m.value) AS p99_value,
          m.metric_name AS name,
          m.unit
        FROM metrics m
        WHERE m.project_id = $2
          AND m.time >= $3
          AND m.time <= $4
          AND m.metric_name = $5
        GROUP BY bucket, m.metric_name, m.unit
        ORDER BY bucket DESC`;
      params = [interval, projectId, from, to, metricName];
    }

    const res = await pool.query(query, params);
    return res.rows || [];
  } catch (error) {
    console.error("Error fetching metrics time-series:", error);
    throw new Error(`Failed to fetch metrics: ${error.message}`);
  }
}export async function getMetricThroughput(projectId, interval, from, to, serverId = null) {
  try {
    // RPS = total requests in bucket / seconds in that bucket window
    const serverFilter = serverId ? 'AND server_id = $6' : '';
    const params = serverId
      ? [interval, projectId, from, to, serverId]
      : [interval, projectId, from, to];

    const query = `
      SELECT
        time_bucket($1, time) AS time_bucket,
        SUM(value) / EXTRACT(EPOCH FROM $1::interval) AS avg_value
      FROM metrics
      WHERE project_id = $2
        AND time >= $3
        AND time <= $4
        AND metric_name = 'request_count'
        ${serverFilter}
      GROUP BY time_bucket
      ORDER BY time_bucket DESC`;

    const res = await pool.query(query, params);
    return res.rows || [];
  } catch (error) {
    console.error('Error fetching throughput:', error);
    throw new Error(`Failed to fetch throughput: ${error.message}`);
  }
}

export async function getMetricErrorRate(projectId, interval, from, to, serverId = null) {
  try {
    // Error rate = (error_count / request_count) * 100 per time bucket
    const serverFilter = serverId ? 'AND server_id = $6' : '';
    const params = serverId
      ? [interval, projectId, from, to, serverId]
      : [interval, projectId, from, to];

    const query = `
      SELECT
        time_bucket($1, time) AS time_bucket,
        SUM(CASE WHEN metric_name = 'error_count' THEN value ELSE 0 END)
          / NULLIF(SUM(CASE WHEN metric_name = 'request_count' THEN value ELSE 0 END), 0)
          * 100 AS avg_value
      FROM metrics
      WHERE project_id = $2
        AND time >= $3
        AND time <= $4
        AND metric_name IN ('error_count', 'request_count')
        ${serverFilter}
      GROUP BY time_bucket
      ORDER BY time_bucket DESC`;

    const res = await pool.query(query, params);
    return res.rows || [];
  } catch (error) {
    console.error('Error fetching error rate:', error);
    throw new Error(`Failed to fetch error rate: ${error.message}`);
  }
}






export async function getLatestMetricsFromRedis(projectId) {
  try {
    const key = `latest_metric:${projectId}`;
    const metrics = await getHash(key);

    if (!metrics || Object.keys(metrics).length === 0) {
      return {};
    }

    const result = {};

    const metricNames = Object.keys(metrics);

    for (let i = 0; i < metricNames.length; i++) {
      const metricName = metricNames[i];
      const stringValue = metrics[metricName];
      const numberValue = parseFloat(stringValue);

      result[metricName] = numberValue;
    }

    return result;
  } catch (error) {
    console.error("Error fetching latest metrics from Redis:", error);
    return {};
  }
}

export async function getLatestMetricsFromDB(projectId, serverId = null) {
  try {
    let query;
    let params;

    if (serverId) {
      query = `
        SELECT DISTINCT ON (m.metric_name)
          m.metric_name AS name,
          m.value,
          m.unit,
          m.time AS timestamp,
          m.server_id,
          s.name AS server_name,
          s.hostname AS server_hostname,
          s.environment AS server_environment
        FROM metrics m
        LEFT JOIN servers s ON m.server_id = s.id
        WHERE m.project_id = $1
          AND m.server_id = $2
          AND m.time >= NOW() - INTERVAL '5 minutes'
        ORDER BY m.metric_name, m.time DESC`;
      params = [projectId, serverId];
    } else {
      query = `
        SELECT DISTINCT ON (m.server_id, m.metric_name)
          m.metric_name AS name,
          m.value,
          m.unit,
          m.time AS timestamp,
          m.server_id,
          s.name AS server_name,
          s.hostname AS server_hostname,
          s.environment AS server_environment
        FROM metrics m
        LEFT JOIN servers s ON m.server_id = s.id
        WHERE m.project_id = $1
          AND m.time >= NOW() - INTERVAL '5 minutes'
        ORDER BY m.server_id, m.metric_name, m.time DESC`;
      params = [projectId];
    }

    const res = await pool.query(query, params);
    return res.rows || [];
  } catch (error) {
    console.error("Error fetching latest metrics from DB:", error);
    throw new Error(`Failed to fetch latest metrics: ${error.message}`);
  }
}

export async function dropOldMetricChunks() {
  const res = await pool.query(
    `SELECT drop_chunk('metrics', INTERVAL '90 days')`,
  );
  return res;
}

export async function getMetricsTableSize() {
  const res = await pool.query(
    `SELECT pg_size_pretty(pg_total_relation_size('metrics')) AS size`,
  );
  return res.rows[0]?.size || "unknown";
}
