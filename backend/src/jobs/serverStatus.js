import cron from "node-cron";
import * as serverRepo from "../modules/servers/serverRepository.js";
import { checkAndFireAlerts } from "../modules/alerts/alertService.js";
import logger from "../utils/logger.js";

async function checkServerStatus() {
  try {
    // 1. Get ONLY servers that are stale AND currently marked as 'online'
    const staleServers = await serverRepo.getStaleServers("60 seconds");

    for (const server of staleServers) {
      // 2. Mark them offline in the database so we don't keep tracking them
      await serverRepo.markServerOffline(server.id);

      logger.info(
        { serverId: server.id },
        "Server marked offline due to missed heartbeat",
      )
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
  cron.schedule("* * * * *", async () => {
    await checkServerStatus();
  });
}
