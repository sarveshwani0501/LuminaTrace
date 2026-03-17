const ROLE_HIERARCHY = {
  member: 1,
  owner: 2,
};

const authorise = (role) => {
  return async function (request, reply) {
    const userId = request.user.userId;

    let organizationId =
      request.params.orgId || request.query.orgId || request.body?.orgId;
    const projectId =
      request.params.projectId ||
      request.query.projectId ||
      request.params.projId ||
      request.body?.projectId;

    if (projectId) {
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

      const trueOrgId = projectResult.rows[0].organization_id;

      if (organizationId && organizationId !== trueOrgId) {
        return reply.code(403).send({
          error: "Forbidden",
          message: "Project does not belong to the specified organization",
        });
      }

      organizationId = trueOrgId;
    }

    if (!organizationId) {
      return reply.code(400).send({
        error: "Bad Request",
        message:
          "Missing Organization ID or Project ID to determine access context",
      });
    }

    const memberResult = await request.server.pg.query(
      `SELECT role FROM organization_members WHERE organization_id = $1 AND user_id = $2`,
      [organizationId, userId],
    );

    if (memberResult.rows.length === 0) {
      return reply.code(403).send({
        error: "Forbidden",
        message: "You do not have access to this resource",
      });
    }

    const userRole = memberResult.rows[0].role;

    if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[role]) {
      return reply.code(403).send({
        error: "Forbidden",
        message: "You do not have permission to perform this action",
      });
    }

    request.orgId = organizationId;
    request.organizationId = organizationId;
    if (projectId) request.projectId = projectId;
    request.userRole = userRole;
  };
};

export default authorise;
