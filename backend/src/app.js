import Fastify from "fastify";
import config from "./config/index.js";
import dbPlugin from "./config/database.js";

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: config.logging.level,
    },
  });

  // Register database plugin
  await fastify.register(dbPlugin);

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
