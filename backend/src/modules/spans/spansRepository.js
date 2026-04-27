import { pool } from "../../config/database.js";

export async function insertSpans(span) {
  const {
    projectId,
    serverId,
    traceId,
    spanId,
    parentSpanId,
    name,
    startTime,
    endTime,
    durationMs,
    metadata,
  } = span;
  const res = await pool.query(
    `INSERT INTO spans (
            project_id,
            server_id,
            trace_id,
            span_id,
            parent_span_id,
            name,
            start_time,
            end_time,
            duration_ms,
            metadata
        ) VALUES (
         $1,
         $2,
         $3,
         $4,
         $5,
         $6,
         $7,
         $8,
         $9,
         $10
        ) RETURNING id`,
    [
      projectId,
      serverId,
      traceId,
      spanId,
      parentSpanId,
      name,
      startTime,
      endTime,
      durationMs,
      metadata,
    ],
  );
  return res.rows[0];
}

export async function getSpansByTraceId(traceId, projectId) {
  const res = await pool.query(
    `SELECT
    s.project_id,
    s.server_id,
    s.trace_id,
    s.span_id,
    s.parent_span_id,
    s.name,
    s.start_time,
    s.end_time,
    s.duration_ms,
    s.metadata,
    s.created_at,
    ser.name as server_name,
    ser.hostname as server_hostname
    FROM spans s
    LEFT JOIN servers ser ON s.server_id = ser.id
    WHERE s.trace_id = $1 AND s.project_id = $2

    ORDER BY start_time`,
    [traceId, projectId],
  );
  return res.rows;
}
