import * as uptimeService from "./uptimeService.js";
import logger from "../../utils/logger.js";

export async function createEndpoint(req, reply) {
  try {
    const { projectId } = req.params;
    const { url, checkIntervalSeconds } = req.body;

    const res = await uptimeService.createEndpoint(projectId, {
      url,
      checkIntervalSeconds,
    });
    return reply.code(201).send(res);
  } catch (error) {
    req.log.error(error);
    return reply
      .code(error.statusCode || 500)
      .send({ message: error.message || "Internal Server Error" });
  }
}

export async function getAllEndpoints(req, reply) {
  try {
    const { projectId } = req.params;

    const res = await uptimeService.getAllEndpoints(projectId);
    return reply.code(200).send(res);
  } catch (error) {
    req.log.error(error);
    return reply
      .code(error.statusCode || 500)
      .send({ message: error.message || "Internal Server Error" });
  }
}

export async function getEndpointById(req, reply) {
  try {
    const { endpointId } = req.params;
    const res = await uptimeService.getEndpointById(endpointId);
    return reply.code(200).send(res);
  } catch (error) {
    req.log.error(error);
    return reply
      .code(error.statusCode || 500)
      .send({ message: error.message || "Internal Server Error" });
  }
}

export async function updateEndpoint(req, reply) {
  try {
    const { endpointId } = req.params;

    const { url, checkIntervalSeconds, isActive } = req.body;

    const res = await uptimeService.updateEndpoint(endpointId, {
      url,
      checkIntervalSeconds,
      isActive,
    });

    return reply.code(200).send(res);
  } catch (error) {
    req.log.error(error);
    return reply
      .code(error.statusCode || 500)
      .send({ message: error.message || "Internal Server Error" });
  }
}

export async function deleteEndpoint(req, reply) {
  try {
    const { endpointId } = req.params;
    const res = await uptimeService.deleteEndpoint(endpointId);

    return reply.code(200).send(res);
  } catch (error) {
    req.log.error(error);
    return reply
      .code(error.statusCode || 500)
      .send({ message: error.message || "Internal Server Error" });
  }
}

export async function getRecentUptimes(req, reply) {
  try {
    const { endpointId } = req.params;
    const { limit } = req.query;
    const res = await uptimeService.getRecentUptimeChecks(endpointId, limit);

    return reply.code(200).send(res);
  } catch (error) {
    return reply
      .code(error.statusCode || 500)
      .send({ message: error.message || "Internal Server Error" });
  }
}

export async function getIncidentHistory(req, reply) {
  try {
    const { endpointId } = req.params;
    const { limit } = req.query;
    const res = await uptimeService.getIncidentHistory(endpointId, limit);

    return reply.code(200).send(res);
  } catch (error) {
    return reply
      .code(error.statusCode || 500)
      .send({ message: error.message || "Internal Server Error" });
  }
}

export async function getUptimePercent(req, reply) {
  try {
    const { endpointId } = req.params;
    const { period } = req.query;
    const res = await uptimeService.getUptimePercentage(endpointId, period);

    return reply.code(200).send(res);
  } catch (error) {
    return reply
      .code(error.statusCode || 500)
      .send({ message: error.message || "Internal Server Error" });
  }
}
