import Fastify from "fastify";
import config from "./config/index.js";
import dbPlugin from "./config/database.js";
import corsPlugin from "./plugins/cors.js";
import jwtPlugin from "./plugins/jwt.js";
import swaggerPlugin from "./plugins/swagger.js";
import rateLimitPlugin from "./plugins/rate-limit.js";
import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from "./modules/auth/authRoute.js";
import organizationRoutes from "./modules/organizations/organizationRoute.js";
import inviteRoute from "./modules/invites/inviteRoute.js";
import projectRoute from "./modules/projects/projectRoute.js";
import ingestRoute from "./modules/ingest/ingestRoute.js";
import logsRoute from "./modules/logs/logsRoute.js";
import metricsRoute from "./modules/metrics/metricsRoute.js";
import alertRoute from "./modules/alerts/alertRoute.js";
import serverRoute from "./modules/servers/serverRoute.js";
import {
  connectProducer,
  disconnectProducer,
  isProducerConnected,
} from "./kafka/producer.js";
import { startLogsWorker } from "./kafka/workers/logsWorker.js";
import { startMetricsWorker } from "./kafka/workers/metricsWorker.js";
import redis from "./config/redis.js";
import { startBackgroundJobs } from "./jobs/index.js";
import { initializeSocketServer } from "./sockets/socket.server.js";

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: config.logging.level,
      transport:
        config.app.env === "development"
          ? {
              target: "pino-pretty",
              options: {
                colorize: true,
              },
            }
          : undefined,
    },
  });

  // Register database plugin
  await fastify.register(dbPlugin);
  // CORS Plugin
  await fastify.register(corsPlugin);
  // JWT Plugin
  await fastify.register(jwtPlugin);
  // Swagger Plugin
  await fastify.register(swaggerPlugin);
  // Rate Limiting Plugin
  await fastify.register(rateLimitPlugin);
  // proper error handling
  fastify.setErrorHandler(errorHandler);

  initializeSocketServer(fastify);

  try {
    await connectProducer();
  } catch (error) {
    fastify.log.error({ error }, "Failed to connect Kafka producer");
  }

  try {
    await startLogsWorker();
    fastify.log.info("Logs worker started successfully");
  } catch (error) {
    fastify.log.error({ error }, "Failed to start logs worker");
  }

  try {
    await startMetricsWorker();
    fastify.log.info("Metrics worker started successfully");
  } catch (error) {
    fastify.log.error({ error }, "Failed to start metrics worker");
  }

  fastify.addHook("onClose", async () => {
    fastify.log.info("Shutting down Kafka producer...");
    await disconnectProducer();
    fastify.log.info("Closing Redis connection...");
    await redis.quit();
  });

  // Register Routes
  await fastify.register(authRoutes);

  await fastify.register(organizationRoutes);

  await fastify.register(inviteRoute);

  await fastify.register(projectRoute);

  await fastify.register(ingestRoute);

  await fastify.register(logsRoute);

  await fastify.register(metricsRoute);

  await fastify.register(alertRoute);

  await fastify.register(serverRoute);

  if (config.app.env !== "test") {
    startBackgroundJobs();
  }

  // Health check

  fastify.get("/health", async (request, reply) => {
    const health = {
      status: "ok",
      environment: config.app.env,
      database: "disconnected",
      kafka: isProducerConnected() ? "connected" : "disconnected",
      redis: "disconnected",
    };

    try {
      await fastify.pg.query("SELECT 1");
      health.database = "connected";
    } catch (error) {
      health.status = "degraded";
      health.error = error.message;
    }

    try {
      await redis.ping();
      health.redis = "connected";
    } catch (error) {
      health.status = "degraded";
      if (!health.error) {
        health.error = error.message;
      }
    }

    if (health.database === "disconnected" || health.redis === "disconnected") {
      reply.code(503);
    }

    return health;
  });

  // fastify.get("/socket-test", (request, reply) => {
  //   import("fs").then((fs) => {
  //     import("path").then((path) => {
  //       const filePath = path.join(process.cwd(), "../socket-test.html");
  //       try {
  //         const html = fs.readFileSync(filePath, "utf8");
  //         reply.type("text/html").send(html);
  //       } catch (e) {
  //         const altFilePath = path.join(process.cwd(), "socket-test.html");
  //         const altHtml = fs.readFileSync(altFilePath, "utf8");
  //         reply.type("text/html").send(altHtml);
  //       }
  //     });
  //   });
  // });

  return fastify;
}

export default buildApp;
