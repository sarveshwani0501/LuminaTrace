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
