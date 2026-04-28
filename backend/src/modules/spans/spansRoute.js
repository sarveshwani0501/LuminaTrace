import * as spansController from "./spansController.js";
import authenticate from "../../middlewares/authenticate.js";
import authorise from "../../middlewares/authorise.js";
import { getSpansByTraceSchema } from "./spansSchema.js";

export default function spansHandler(fastify, options, done) {
  fastify.get(
    "/traces/:traceId/spans",
    {
      schema: getSpansByTraceSchema,
      preHandler: [authenticate, authorise("member")],
    },
    spansController.getSpansByTraceHandler
  );
  done();
}