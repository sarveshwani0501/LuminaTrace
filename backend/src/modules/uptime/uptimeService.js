// ### Routes needed:
// ```
// POST   /projects/:projectId/endpoints        → Add URL to monitor
// GET    /projects/:projectId/endpoints        → List all monitored URLs
// GET    /endpoints/:endpointId                → Get one endpoint
// PUT    /endpoints/:endpointId                → Update endpoint (URL, interval)
// DELETE /endpoints/:endpointId                → Stop monitoring URL
// GET    /endpoints/:endpointId/checks         → Get recent checks (uptime history)
// GET    /endpoints/:endpointId/incidents      → Get incident history
// GET    /endpoints/:endpointId/uptime         → Get uptime % (99.9%)

import * as uptimeRepo from "./uptimeRepository.js";
import { getCorrectInterval } from "../../utils/timeWindow.js";

export async function createEndpoint(projectId, data) {
  if (!projectId) {
    throw { statusCode: 400, message: "Project ID is required" };
  }
  const res = await uptimeRepo.createEndpoint(projectId, data);
  return res;
}

export async function getAllEndpoints(projectId) {
  if (!projectId) {
    throw { statusCode: 400, message: "Project ID is required" };
  }
  const endPoints = await uptimeRepo.getAllEndpoints(projectId);

  return {
    endPoints: endPoints || [],
  };
}

export async function getEndpointById(endpointId) {
  if (!endpointId) {
    throw { statusCode: 400, message: "Endpoint ID is required" };
  }
  const res = await uptimeRepo.getEndpointById(endpointId);

  return res;
}

export async function updateEndpoint(endpointId, data) {
  if (!endpointId) {
    throw { statusCode: 400, message: "Endpoint ID is required" };
  }

  const res = await uptimeRepo.updateEndpoint(endpointId, data);

  return res;
}

export async function deleteEndpoint(endpointId) {
  if (!endpointId) {
    throw { statusCode: 400, message: "Endpoint ID is required" };
  }

  const res = await uptimeRepo.deleteEndpointById(endpointId);

  if (res) {
    return {
      message: "Endpoint deleted successfully",
    };
  }
  throw {
    statusCode: 404,
    message: "Endpoint not found",
  };
}

export async function getRecentUptimeChecks(endpointId, limit) {
  if (!endpointId) {
    throw { statusCode: 400, message: "Endpoint ID is required" };
  }

  const recentChecks = await uptimeRepo.getRecentChecks(endpointId, limit);

  return {
    recentChecks: recentChecks || [],
  };
}

export async function getIncidentHistory(endpointId, limit) {
  if (!endpointId) {
    throw { statusCode: 400, message: "Endpoint ID is required" };
  }

  const incidentHistory = await uptimeRepo.getIncidentHistory(endpointId, limit);

  return {
    incidentHistory: incidentHistory || [],
  };
}

export async function getUptimePercentage(endpointId, period) {
  if (!endpointId) {
    throw { statusCode: 400, message: "Endpoint ID is required" };
  }
  const formattedPeriod = getCorrectInterval(period);

  const res = await uptimeRepo.calculateUptime(endpointId, formattedPeriod);

  return res;
}
