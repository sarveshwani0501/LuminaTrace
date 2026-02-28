import createConsumer from "../consumer.js";
import logger from "../../utils/logger.js";
import { topics } from "../topics.js";
import {
  findServerByHostName,
  createServer,
} from "../../modules/servers/serverRepository.js";

import redis, { incrementHashField, pushAndTrim } from "../../config/redis.js";

import * as logRepo from "../../modules/logs/logsRepository.js";

export async function startLogsWorker() {
  const consumer = createConsumer("logs-worker");
  // connecting the consumer
  await consumer.connect();
  logger.info("Logs Consumer connected");

  // subscribing to the logs topic
  await consumer.subscribe({
    topic: topics.LOGS,
    fromBeginning: false,
  });

  // and then we will do the running process for each message inside kafka

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      let log;
      try {
        log = JSON.parse(message.value.toString());

        logger.debug(
          { projectId: log.projectId, level: log.level },
          "Log is being Processed",
        );

        if (!log.serverId && log.hostname) {
          const projectId = log.projectId;
          const hostname = log.hostname;
          // if serverId is null
          // we find by hostname if we can get the server details
          let server = await findServerByHostName({
            projectId,
            hostname,
          });

          if (!server) {
            log.serverId = await createServer({ projectId, hostname });
            logger.info({ hostname: hostname }, "Auto registered server");
          } else {
            log.serverId = server.id;
          }
        }

        await logRepo.insertLog(log);

        // now Redis comes into picture
        const statsKey = `stats:${log.projectId}:today`;

        await incrementHashField(statsKey, "total_requests", 1);

        if (log.level === "ERROR") {
          await incrementHashField(statsKey, "error_count", 1);
        } else if (log.level === "WARN") {
          await incrementHashField(statsKey, "warn_count", 1);
        }

        const now = Date.now();

        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const ttl = Math.floor((endOfDay - now) / 1000);
        await redis.expire(statsKey, ttl);

        const recentLogsKey = `recent_logs:${log.projectId}`;

        const logsSummary = JSON.stringify({
          timestamp: log.timestamp,
          level: log.level,
          message: log.message.substring(0, 100),
          serverId: log.serverId,
        });

        await pushAndTrim(recentLogsKey, logsSummary, 100);

        // sockets working here

        logger.debug(
          { projectId: log.projectId },
          "Log processed successfully",
        );
      } catch (err) {
        logger.error({ err, log }, "Failed to process the log");
      }
    },
  });
}
