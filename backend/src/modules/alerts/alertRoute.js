import authenticate from "../../middlewares/authenticate.js";
import authorise from "../../middlewares/authorise.js";
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
      preHandler: [authenticate, authorise("member")],
    },
    alertController.createRule,
  );

  fastify.get(
    "/alerts",
    {
      schema: getAllRulesSchema,
      preHandler: [authenticate, authorise("member")],
    },
    alertController.listAllRules,
  );

  // IMPORTANT: /alerts/events MUST be registered before /alerts/:id
  // otherwise Fastify matches the literal string 'events' as the :id param
  fastify.get(
    "/alerts/events",
    {
      schema: getAllEventsSchema,
      preHandler: [authenticate, authorise("member")],
    },
    alertController.getAllEvents,
  );

  fastify.get(
    "/alerts/:id",
    {
      schema: getRuleByIdSchema,
      preHandler: [authenticate, authorise("member")],
    },
    alertController.getRuleById,
  );

  fastify.patch(
    "/alerts/:id",
    {
      schema: updateRuleSchema,
      preHandler: [authenticate, authorise("member")],
    },
    alertController.updateRule,
  );

  fastify.delete(
    "/alerts/:id",
    {
      schema: deleteRuleSchema,
      preHandler: [authenticate, authorise("admin")],
    },
    alertController.deleteRule,
  );

  fastify.patch(
    "/alerts/:id/toggle",
    {
      schema: toggleStatusSchema,
      preHandler: [authenticate, authorise("member")],
    },
    alertController.toggleRuleActivity,
  );

  // (events route moved above :id — see above)

  done();
}
