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

  // Register Routes
  await fastify.register(authRoutes);

  await fastify.register(organizationRoutes);

  await fastify.register(inviteRoute);

  await fastify.register(projectRoute);

  fastify.get("/health", async (request, reply) => {
    try {
      await fastify.pg.query("SELECT 1");

      return {
        status: "ok",
        environment: config.app.env,
        database: "connected",
      };
    } catch (error) {
      reply.code(503);
      return {
        status: "error",
        error: error.message,
        database: "disconnected",
      };
    }
  });

  return fastify;
}

export default buildApp;
