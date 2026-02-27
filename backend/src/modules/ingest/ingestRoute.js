import * as ingestController from "./ingestController.js";
import authenticateKey from "../../middlewares/authenticateKey.js";
import { logSchema, metricsSchema, heartBeatSchema } from "./ingestSchema.js";

export default async function ingestRoute(fastify) {
  fastify.post(
    "/ingest/logs",
    {
      schema: logSchema,
      preHandler: [authenticateKey],
    },
    ingestController.ingestLogs,
  );

  fastify.post(
    "/ingest/metrics",
    {
      schema: metricsSchema,
      preHandler: [authenticateKey],
    },
    ingestController.ingestMetrics,
  );

  fastify.post(
    "/ingest/heartbeat",
    {
      schema: heartBeatSchema,
      preHandler: [authenticateKey],
    },
    ingestController.heartbeat,
  );
}
