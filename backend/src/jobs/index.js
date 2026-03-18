import { scheduleDataRetention } from "./dataRetention.js";
import { scheduleHealthChecks } from "./healthMonitoring.js";
import { scheduleServerStatusCheck } from "./serverStatus.js";
import logger from "../utils/logger.js";

let jobsStarted = false;

export function startBackgroundJobs() {
  if (jobsStarted) {
    logger.info("Background jobs already started, skipping duplicate init");
    return;
  }

  logger.info("Starting background jobs....................");

  scheduleServerStatusCheck();
  scheduleHealthChecks();
  scheduleDataRetention();

  jobsStarted = true;

  logger.info("Background jobs started......................");
}
