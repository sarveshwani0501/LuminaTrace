import authenticate from "../../middlewares/authenticate.js";
import authorise from "../../middlewares/authorise.js";
import * as projectController from "./projectController.js";
import {
  getAllProjectSchema,
  getProjectInfoSchema,
  createProjectSchema,
  updateProjectSchema,
  updateAPIKeySchema,
  deleteProjectSchema,
} from "./projectSchema.js";

// GET    /organizations/:orgId/projects         → list all projects -- repo
// POST   /organizations/:orgId/projects         → create a project
// GET    /organizations/:orgId/projects/:projId → get project details + api_key
// PUT    /organizations/:orgId/projects/:projId → update project
// DELETE /organizations/:orgId/projects/:projId → delete project

// POST /organizations/:orgId/projects/:projId/rotate-key

export default async function projectRoute(fastify) {
  fastify.get(
    "/organizations/:orgId/projects",
    {
      schema: getAllProjectSchema,
      preHandler: [authenticate, authorise("member")],
    },
    projectController.getAllProjectsHandler,
  );

  fastify.post(
    "/organizations/:orgId/projects",
    {
      schema: createProjectSchema,
      preHandler: [authenticate, authorise("member")],
    },
    projectController.createProjectHandler,
  );

  fastify.get(
    "/organizations/:orgId/projects/:projId",
    {
      schema: getProjectInfoSchema,
      preHandler: [authenticate, authorise("member")],
    },
    projectController.getProjectInfoHandler,
  );

  fastify.put(
    "/organizations/:orgId/projects/:projId",
    {
      schema: updateProjectSchema,
      preHandler: [authenticate, authorise("member")],
    },
    projectController.updateProjectInfoHandler,
  );

  fastify.delete(
    "/organizations/:orgId/projects/:projId",
    {
      schema: deleteProjectSchema,
      preHandler: [authenticate, authorise("owner")],
    },
    projectController.deleteProjectHandler,
  );

  fastify.put(
    "/organizations/:orgId/projects/:projId/rotate-key",
    {
      schema: updateAPIKeySchema,
      preHandler: [authenticate, authorise("owner")],
    },
    projectController.updateAPIKeyHandler,
  );
}
