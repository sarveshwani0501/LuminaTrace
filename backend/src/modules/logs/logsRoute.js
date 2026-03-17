import * as logController from "./logsController.js";
import {
  allLogsSchema,
  recentLogsSchema,
  statsSchema,
  topRoutesSchema,
  logsVolumeSchema,
  errorRateSchema,
} from "./logsSchema.js";
import authorise from "../../middlewares/authorise.js";
import authenticate from "../../middlewares/authenticate.js";

// GET  /logs?projectId=X&timerange=1h&level=ERROR&serverId=Y&limit=100&offset=0
// GET  /logs/recent?projectId=X&limit=100
// GET  /logs/stats?projectId=X
// GET  /logs/routes?projectId=X&timerange=1h&limit=100&sortBy=count
// GET /logs/volume?projectId=X&timerange=30m
// GET /logs/error?projectId=X

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
}
