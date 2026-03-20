import * as serverRepo from "./serverRepository.js";
import logger from "../../utils/logger.js";
import redis from "../../config/redis.js";

export async function listAllServers(projectId) {
  if (!projectId) {
    throw {
      statusCode: 400,
      message: "Project ID is required",
    };
  }

  const servers = await serverRepo.getServerByProject(projectId);

  return { servers: servers || [] };
}

export async function getServerDetails(serverId, projectId) {
  if (!projectId || !serverId) {
    throw {
      statusCode: 400,
      message: "Missing required parameters",
    };
  }

  const server = await serverRepo.getServerById(serverId, projectId);

  if (!server) {
    throw {
      statusCode: 404,
      message: "Server not found",
    };
  }

  // latest metric can be taken from redis
  const latestMetricKey = `latest_metric:${projectId}`;

  const latestMetrics = await redis.hgetall(latestMetricKey);

  const secondsSinceHeartBeat = Math.floor(
    (Date.now() - new Date(server.last_heartbeat_at).getTime()) / 100,
  );

  return {
    ...server,
    secondsSinceHeartBeat,
    latestMetrics: latestMetrics || {},
  };
}
