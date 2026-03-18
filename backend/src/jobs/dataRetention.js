//
import cron from "node-cron";
import logger from "../utils/logger.js";
import * as logRepo from "../modules/logs/logsRepository.js";

import * as metricRepo from "../modules/metrics/metricsRepository.js";

import * as uptimeRepo from "../modules/uptime/uptimeRepository.js";

export function scheduleDataRetention() {
  cron.schedule("0 2 * * *", async () => {
    await cleanupOldData();
    logger.info("Data retention job scheduled (daily at 2:00 AM)");
  });
}

async function cleanupOldData() {
  try {
    logger.info("STARTING CLEANUP JOB ............");
    // need to drop older chunks
    // first the logs  chunk
    await logRepo.dropOldLogChunks();
    const logsTableSize = await logRepo.getLogsTableSize();

    logger.info("LOGS TABLE CLEANED, SIZE: " + logsTableSize);

    // then metrics chunks

    await metricRepo.dropOldMetricChunks();

    const metricsTableSize = await metricRepo.getMetricsTableSize();

    logger.info("METRICS TABLE CLEANED, SIZE: " + metricsTableSize);

    // then uptime checks chunks

    await uptimeRepo.dropOldUptimeChunks();

    const uptimeTableSize = await uptimeRepo.getUptimeCheckTableSize();

    logger.info("UPTIME_CHECKS TABLE CLEANED, SIZE: " + uptimeTableSize);
  } catch (err) {
    logger.error({ err }, "Data retention job failed");
  }
}
