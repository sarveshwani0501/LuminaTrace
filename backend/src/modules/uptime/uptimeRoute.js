import authenticate from "../../middlewares/authenticate.js";
import authorise from "../../middlewares/authorise.js";
import * as uptimeController from "./uptimeController.js";
import {
  createEndpointSchema,
  getAllEndpointsSchema,
  getEndpointByIdSchema,
  updateEndpointSchema,
  deleteEndpointSchema,
  getRecentUptimesSchema,
  getIncidentHistorySchema,
  getUptimePercentSchema,
} from "./uptimeSchema.js";
// POST   /projects/:projectId/endpoints        → Add URL to monitor
// GET    /projects/:projectId/endpoints        → List all monitored URLs
// GET    /endpoints/:endpointId                → Get one endpoint
// PUT    /endpoints/:endpointId                → Update endpoint (URL, interval)
// DELETE /endpoints/:endpointId                → Stop monitoring URL
// GET    /endpoints/:endpointId/checks         → Get recent checks (uptime history)
// GET    /endpoints/:endpointId/incidents      → Get incident history
// GET    /endpoints/:endpointId/uptime         → Get uptime % (99.9%)

export async function uptimeRoute(fastify) {
  //
  fastify.post(
    "/projects/:projectId/endpoints",
    {
      schema: createEndpointSchema,
      preHandler: [authenticate, authorise("member")],
    },
    uptimeController.createEndpoint,
  );

  //
  fastify.get(
    "/projects/:projectId/endpoints",
    {
      schema: getAllEndpointsSchema,
      preHandler: [authenticate, authorise("member")],
    },
    uptimeController.getAllEndpoints,
  );

  //
  fastify.get(
    "/endpoints/:endpointId",
    {
      schema: getEndpointByIdSchema,
      preHandler: [authenticate, authorise("member")],
    },
    uptimeController.getEndpointById,
  );

  //
  fastify.patch(
    "/endpoints/:endpointId",
    {
      schema: updateEndpointSchema,
      preHandler: [authenticate, authorise("member")],
    },
    uptimeController.updateEndpoint,
  );

  //
  fastify.delete(
    "/endpoints/:endpointId",
    {
      schema: deleteEndpointSchema,
      preHandler: [authenticate, authorise("owner")],
    },
    uptimeController.deleteEndpoint,
  );

  //
  fastify.get(
    "/endpoints/:endpointId/checks",
    {
      schema: getRecentUptimesSchema,
      preHandler: [authenticate, authorise("member")],
    },
    uptimeController.getRecentUptimes,
  );

  fastify.get(
    "/endpoints/:endpointId/incidents",
    {
      schema: getIncidentHistorySchema,
      preHandler: [authenticate, authorise("member")],
    },
    uptimeController.getIncidentHistory,
  );

  fastify.get(
    "/endpoints/:endpointId/uptime",
    {
      schema: getUptimePercentSchema,
      preHandler: [authenticate, authorise("member")],
    },
    uptimeController.getUptimePercent,
  );
}
