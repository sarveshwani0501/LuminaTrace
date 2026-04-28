import createConsumer from "../consumer.js";
import { topics } from "../topics.js";
import logger from "../../utils/logger.js";
import {
  createServer,
  findServerById,
  findServerByHostName,
} from "../../modules/servers/serverRepository.js";
import { insertSpans } from "../../modules/spans/spansRepository.js";

export async function startSpansWorker() {
  const consumer = createConsumer("spans-worker");

  await consumer.connect();

  logger.info("Spans worker connected");

  await consumer.subscribe({ topic: topics.SPANS, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      let span;
      try {
        span = JSON.parse(message.value.toString());
        let serverName;
        logger.debug(
          { projectId: span.projectId, name: span.name },
          "Processing span",
        );

        if (span.serverId) {
          const server = await findServerById({
            serverId: span.serverId,
          });
          if (!server) {
            if (span.hostname) {
              logger.warn(
                {
                  serverId: span.serverId,
                  hostname: span.hostname,
                },
                "ServerId not found, using hostname instead",
              );
              const serverByHost = await findServerByHostName({
                projectId: span.projectId,
                hostname: span.hostname,
              });
              if (serverByHost) {
                span.serverId = serverByHost.id;
                serverName = serverByHost.name;
              } else {
                const newServerId = await createServer({
                  projectId: span.projectId,
                  hostname: span.hostname,
                });
                span.serverId = newServerId;
                serverName = span.hostname;
                logger.info(
                  { hostname: span.hostname },
                  "Auto registered server",
                );
              }
            } else {
              logger.warn(
                { serverId: span.serverId },
                "ServerId not found and no hostname provided, setting serverId to null",
              );
              span.serverId = null;
            }
          }
        } else if (span.hostname) {
          const server = await findServerByHostName({
            projectId: span.projectId,
            hostname: span.hostname,
          });
          if (server) {
            span.serverId = server.id;
            serverName = server.name;
          } else {
            const newServerId = await createServer({
              projectId: span.projectId,
              hostname: span.hostname,
            });
            span.serverId = newServerId;
            serverName = span.hostname;
            logger.info({ hostname: span.hostname }, "Auto registered server");
          }
        }

        await insertSpans(span);
      } catch (error) {
        logger.error({ error, span }, "Failed to process spans message");
      }
    },
  });
}
