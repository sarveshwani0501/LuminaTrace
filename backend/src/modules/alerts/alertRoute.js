import authenticate from "../../middlewares/authenticate.js";
import authoriseProject from "../../middlewares/authoriseProject.js";
import * as alertController from "./alertController.js";
import {
  createRuleSchema,
  getAllRulesSchema,
  getRuleByIdSchema,
  updateRuleSchema,
  deleteRuleSchema,
  toggleStatusSchema,
  getAllEventsSchema,
} from "./alertSchema.js";

export default function alertRoute(fastify, options, done) {
  fastify.post(
    "/alerts",
    {
      schema: createRuleSchema,
      preHandler: [authenticate, authoriseProject("member")],
    },
    alertController.createRule,
  );

  fastify.get(
    "/alerts",
    {
      schema: getAllRulesSchema,
      preHandler: [authenticate, authoriseProject("member")],
    },
    alertController.listAllRules,
  );

  fastify.get(
    "/alerts/:id",
    {
      schema: getRuleByIdSchema,
      preHandler: [authenticate, authoriseProject("member")],
    },
    alertController.getRuleById,
  );

  fastify.patch(
    "/alerts/:id",
    {
      schema: updateRuleSchema,
      preHandler: [authenticate, authoriseProject("member")],
    },
    alertController.updateRule,
  );

  fastify.delete(
    "/alerts/:id",
    {
      schema: deleteRuleSchema,
      preHandler: [authenticate, authoriseProject("admin")],
    },
    alertController.deleteRule,
  );

  fastify.patch(
    "/alerts/:id/toggle",
    {
      schema: toggleStatusSchema,
      preHandler: [authenticate, authoriseProject("member")],
    },
    alertController.toggleRuleActivity,
  );

  fastify.get(
    "/alerts/events",
    {
      schema: getAllEventsSchema,
      preHandler: [authenticate, authoriseProject("member")],
    },
    alertController.getAllEvents,
  );

  done();
}
