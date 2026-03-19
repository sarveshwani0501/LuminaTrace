import { pool } from "../config/database.js";

export async function verifyProjectAccess(userId, projectId) {
  const res = await pool.query(
    `SELECT 1
        FROM projects p
        JOIN organizations o ON o.id = p.organization_id
        JOIN organization_members om ON om.organization_id = o.id
        WHERE p.id = $1 AND om.user_id = $2
        LIMIT 1`,
    [projectId, userId],
  );

  return res.rows.length > 0;
}
