const ROLE_HIERARCHY = {
  member: 1,
  owner: 2,
};

const authorise = (role) => {
  return async function (request, reply) {
    const orgId = request.params.orgId;
    const userId = request.user.userId;

    if (!orgId) {
      return reply.code(400).send({
        error: "Bad Request",
        message: "Organization ID is required in the URL",
      });
    }

    const result = await request.server.pg.query(
      `SELECT role FROM organization_members WHERE organization_id = $1 AND user_id = $2`,
      [orgId, userId],
    );

    if (result.rows.length === 0) {
      return reply.code(403).send({
        error: "Forbidden",
        message: "You do not have access to this organization",
      });
    }

    const userRole = result.rows[0].role;

    if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[role]) {
      return reply.code(403).send({
        error: "Forbidden",
        message: "You do not have permission to perform this",
      });
    }

    request.orgId = orgId;
    request.userRole = userRole;
  };
};

export default authorise;
