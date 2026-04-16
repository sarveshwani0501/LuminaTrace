import cron from "node-cron";
import * as serverRepo from "../modules/servers/serverRepository.js";
import * as metricsRepo from "../modules/metrics/metricsRepository.js";
import logger from "../utils/logger.js";

async function checkServerStatus() {
  try {
    // 1. Get ONLY servers that are stale AND currently marked as 'online'
    const staleServers = await serverRepo.getStaleServers("60 seconds");

    if (staleServers.length > 0) {
      logger.info(`Found ${staleServers.length} stale servers`);
      for (const server of staleServers) {
        // 2. Mark them offline in the database so we don't keep tracking them
        await serverRepo.markServerOffline(server.id);

        logger.info(
          { serverId: server.id },
          "Server marked offline due to missed heartbeat",
        );
      }
    }

    // 3. Log active online configurations for ALL projects into timeseries table
    const onlineCounts = await serverRepo.countOnlineServersByProject();
    
    if (onlineCounts.length > 0) {
      const now = new Date();
      const metrics = onlineCounts.map(item => ({
        timestamp: now,
        projectId: item.project_id,
        serverId: null,
        name: "active_connections",
        value: item.online_count,
        unit: "servers",
        tags: {}
      }));
      
      await metricsRepo.insertMetricBatch(metrics);
    }
  } catch (error) {
    logger.error(
      { error },
      "Error occured while performing Server status check",
    );
  }
}

export function scheduleServerStatusCheck() {
  // Runs at the 0th second of every minute
  cron.schedule("*/60 * * * * *", async () => {
    await checkServerStatus();
  });
  logger.info("Server status check scheduled (every minute)");
}
