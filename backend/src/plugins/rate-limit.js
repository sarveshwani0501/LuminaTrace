import fastifyRateLimit from "@fastify/rate-limit";
import fp from "fastify-plugin";

async function rateLimitPlugin(fastify, options) {
  await fastify.register(fastifyRateLimit, {
    global: true,
    max: 100, // no of requests
    timeWindow: "1 minute", // duration
    allowList: ["127.0.0.1"],
  });
}

export default fp(rateLimitPlugin);
