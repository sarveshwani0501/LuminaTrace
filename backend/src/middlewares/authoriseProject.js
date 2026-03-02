const ROLE_HIERARCHY = {
  member: 1,
  owner: 2,
};

const authoriseProject = (role) => {
  return async function (request, reply) {
    const projectId = request.query.projectId;
    const userId = request.user.userId;

    if (!projectId) {
      return reply.code(400).send({
        error: "Bad Request",
        message: "Project ID is required in query parameters",
      });
    }

    const projectResult = await request.server.pg.query(
      `SELECT organization_id FROM projects WHERE id = $1`,
      [projectId],
    );

    if (projectResult.rows.length === 0) {
      return reply.code(404).send({
        error: "Not Found",
        message: "Project not found",
      });
    }

    const organizationId = projectResult.rows[0].organization_id;

    const memberResult = await request.server.pg.query(
      `SELECT role FROM organization_members WHERE organization_id = $1 AND user_id = $2`,
      [organizationId, userId],
    );

    if (memberResult.rows.length === 0) {
      return reply.code(403).send({
        error: "Forbidden",
        message: "You do not have access to this project",
      });
    }

    const userRole = memberResult.rows[0].role;

    if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[role]) {
      return reply.code(403).send({
        error: "Forbidden",
        message: "You do not have permission to perform this action",
      });
    }

    request.projectId = projectId;
    request.organizationId = organizationId;
    request.userRole = userRole;
  };
};

export default authoriseProject;
