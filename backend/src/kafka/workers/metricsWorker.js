import * as metricRepo from "../../modules/metrics/metricsRepository.js";
import createConsumer from "../consumer.js";
import { topics } from "../topics.js";
import {
  findServerById,
  findServerByHostName,
  createServer,
} from "../../modules/servers/serverRepository.js";
import logger from "../../utils/logger.js";
import redis, { incrementHashField } from "../../config/redis.js";
import { insertMetric } from "../../modules/metrics/metricsRepository.js";
import * as alertsService from "../../modules/alerts/alertService.js";

import { getIO } from "../../sockets/socket.server.js";

export async function startMetricsWorker() {
  const consumer = createConsumer("metrics-worker");

  await consumer.connect();
  logger.info("Metrics worker connected");

  await consumer.subscribe({ topic: topics.METRICS, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      let metric;
      try {
        metric = JSON.parse(message.value.toString());

        logger.debug(
          { projectId: metric.projectId, name: metric.name },
          "Processing metric",
        );

        let serverName = null;

        if (metric.serverId) {
          const server = await findServerById({ serverId: metric.serverId });
          if (!server) {
            if (metric.hostname) {
              logger.warn(
                { serverId: metric.serverId, hostname: metric.hostname },
                "ServerId not found, using hostname instead",
              );
              const serverByHost = await findServerByHostName({
                projectId: metric.projectId,
                hostname: metric.hostname,
              });
              if (serverByHost) {
                metric.serverId = serverByHost.id;
                serverName = serverByHost.name;
              } else {
                metric.serverId = await createServer({
                  projectId: metric.projectId,
                  hostname: metric.hostname,
                });
                serverName = metric.hostname;
                logger.info(
                  { hostname: metric.hostname },
                  "Auto registered server",
                );
              }
            } else {
              logger.warn(
                { serverId: metric.serverId },
                "ServerId not found and no hostname provided, setting serverId to null",
              );
              metric.serverId = null;
            }
          }
        } else if (metric.hostname) {
          const server = await findServerByHostName({
            projectId: metric.projectId,
            hostname: metric.hostname,
          });
          if (server) {
            metric.serverId = server.id;
            serverName = server.name;
          } else {
            metric.serverId = await createServer({
              projectId: metric.projectId,
              hostname: metric.hostname,
            });
            serverName = metric.hostname;
            logger.info(
              { hostname: metric.hostname },
              "Auto registered server",
            );
          }
        }

        await insertMetric(metric);

        const metricKey = `latest_metric:${metric.projectId}`;

        await redis.hset(metricKey, metric.name, metric.value);
        await redis.expire(metricKey, 300);

        if (metric.name === "response_time" || metric.name === "latency") {
          const statsKey = `stats:${metric.projectId}:today`;
          await incrementHashField(statsKey, "response_time", metric.value);
          await incrementHashField(statsKey, "latency_count", 1);

          const now = Date.now();

          const endOfDay = new Date(now);

          endOfDay.setHours(23, 59, 59, 999);

          const ttl = Math.floor((endOfDay - now) / 1000);

          await redis.expire(statsKey, ttl);
        }

        await alertsService.checkAndFireAlerts(
          metric.projectId,
          metric.name,
          metric.value,
          metric.serverId || null,
          serverName || null,
        );

        // socket io code

        // metric.timestamp,
        // metric.projectId,
        // metric.serverId,
        // metric.name,
        // metric.value,
        // metric.unit,
        // metric.tags ? JSON.stringify(metric.tags) : "{}"

        const io = getIO();

        io.to(`project:${metric.projectId}`).emit("new_metric", {
          time: metric.timestamp,
          name: metric.name,
          value: metric.value,
          unit: metric.unit,
          tags: metric.tags,
        });

        logger.debug(
          { projectId: metric.projectId },
          "Metrics processed successfully",
        );
      } catch (err) {
        logger.error({ err, span }, "Failed to process span message");
      }
    },
  });
}
