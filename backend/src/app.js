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
import spansRoute from "./modules/spans/spansRoute.js";
import { uptimeRoute } from "./modules/uptime/uptimeRoute.js";
import {
  connectProducer,
  disconnectProducer,
  isProducerConnected,
} from "./kafka/producer.js";
import { startLogsWorker } from "./kafka/workers/logsWorker.js";
import { startMetricsWorker } from "./kafka/workers/metricsWorker.js";
import { startSpansWorker } from "./kafka/workers/spansWorker.js";
import redis from "./config/redis.js";
import { startBackgroundJobs } from "./jobs/index.js";
import { initializeSocketServer } from "./sockets/socket.server.js";
import { initializeTopics } from "./kafka/initTopics.js";


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
    await initializeTopics();
    fastify.log.info("Kafka topics initialized");
  } catch (error) {
    fastify.log.error({ error }, "Failed to initialize Kafka topics — aborting startup");
    process.exit(1);
  }



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

  try {
    await startSpansWorker();
    fastify.log.info("Spans worker started successfully");
  } catch (error) {
    fastify.log.error({ error }, "Failed to start spans worker");
  }

  fastify.addHook("onClose", async () => {
    fastify.log.info("Shutting down Kafka producer...");
    await disconnectProducer();
    
    fastify.log.info("Closing Redis connection...");
    await redis.quit?.();
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
  
  await fastify.register(spansRoute);

  await fastify.register(uptimeRoute);

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

  

  return fastify;
}

export default buildApp;
