import * as logController from "./logsController.js";
import {
  allLogsSchema,
  recentLogsSchema,
  statsSchema,
  topRoutesSchema,
  logsVolumeSchema,
  errorRateSchema,
  getLogsByTraceSchema,
} from "./logsSchema.js";
import authorise from "../../middlewares/authorise.js";
import authenticate from "../../middlewares/authenticate.js";



export default async function logsRoute(fastify) {
  fastify.get(
    "/logs",
    {
      schema: allLogsSchema,
      preHandler: [authenticate, authorise("member")],
    },
    logController.getAllLogs,
  );

  fastify.get(
    "/logs/recent",
    {
      schema: recentLogsSchema,
      preHandler: [authenticate, authorise("member")],
    },
    logController.getRecentLogs,
  );

  fastify.get(
    "/logs/stats",
    {
      schema: statsSchema,
      preHandler: [authenticate, authorise("member")],
    },
    logController.getLogsStats,
  );

  fastify.get(
    "/logs/routes",
    {
      schema: topRoutesSchema,
      preHandler: [authenticate, authorise("member")],
    },
    logController.getTopRoutes,
  );

  fastify.get(
    "/logs/volume",
    {
      schema: logsVolumeSchema,
      preHandler: [authenticate, authorise("member")],
    },
    logController.getLogsVolume,
  );

  fastify.get(
    "/logs/error",
    {
      schema: errorRateSchema,
      preHandler: [authenticate, authorise("member")],
    },
    logController.getErrorRate,
  );

  fastify.get(
    "/logs/:traceId",
    {
      schema: getLogsByTraceSchema,
      preHandler: [authenticate, authorise("member")],
    },
    logController.getLogsByTraceId,
  );
}
