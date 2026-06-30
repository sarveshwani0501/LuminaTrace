import axios from "axios";

import cron from "node-cron";
import * as uptimeRepo from "../modules/uptime/uptimeRepository.js";
import redis from "../config/redis.js";
import logger from "../utils/logger.js";



export function scheduleHealthChecks() {
  cron.schedule("*/30 * * * * *", async () => {
    await runHealthChecks();
  });
  logger.info("Health check job scheduled (every 30 seconds)");
}

async function handleCheckResult(endpoint, result) {
  // lets find active incident if any

  const activeIncident = await uptimeRepo.getActiveIncident(endpoint.id);

  // cases
  // If result.up == TRUE AND NO INCIDENT
  // nothing to do

  if (result.isUp && !activeIncident) {
    return;
  }

  // If result.up == TRUE AND INCIDENT
  // need to resolve
  if (result.isUp && activeIncident) {
    await uptimeRepo.resolveIncident(activeIncident.id);
    logger.info({ endpointId: endpoint.id }, "Endpoint recovered");
    // can also send resolve email
    return;
  }

  // If result.up == FALSE AND !INCIDENT
  // need to create an incident and send alert
  if (!result.isUp && !activeIncident) {
    await uptimeRepo.createIncident(endpoint.id, result.error);
    logger.warn(
      { endpointId: endpoint.id, error: result.error },
      "New incident created",
    );
    // can also send alert mail
    return;
  }

  // if result.up == FALSE AND INCIDENT
  // increment failure count
  if (!result.isUp && activeIncident) {
    await uptimeRepo.incrementFailureCount(activeIncident.id);
    logger.debug(
      {
        endpointId: endpoint.id,
        failureCount: activeIncident.failure_count + 1,
      },
      "Incident ongoing",
    );
  }
}

async function runHealthChecks() {
  const lock = "job:health-check";

  
  const acquired = await redis.set(lock, "locked", { nx: true, ex: 25 });

  if (!acquired) {
    logger.debug("Health check already running on another instance");
    return;
  }

 
  try {
    const allEndpoints = await uptimeRepo.getAllActiveEndpointsAcrossProjects();

    for (const endpoint of allEndpoints) {
      try {
        const res = await checkEndpoint(endpoint.url);

        await uptimeRepo.reportUptimeCheck({
          endpointId: endpoint.id,
          isUp: res.isUp,
          statusCode: res.statusCode,
          responseTime: res.responseTime,
          errorMessage: res.error,
        });

        await handleCheckResult(endpoint, res);
      } catch (err) {
        logger.error(
          { err, endpointId: endpoint.id },
          "Failed to check endpoint",
        );
      }
    }
  } catch (err) {
    logger.error({ err }, "Health check job failed");
  } finally {
    await redis.del(lock);
  }
}

export async function checkEndpoint(url) {
  const start = Date.now();
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      validateStatus: () => true,
    });

    const responseTime = Date.now() - start;

    return {
      url,
      statusCode: response.status,
      responseTime,
      isUp: response.status >= 200 && response.status < 300,
      error: null,
    };
  } catch (err) {
    const responseTime = Date.now() - start;

    return {
      url,
      statusCode: err?.response?.status || null,
      responseTime,
      isUp: false,
      error: err.code === "ECONNABORTED" ? "Timeout" : err.message,
    };
  }
}
