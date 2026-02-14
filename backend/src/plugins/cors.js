import fp from "fastify-plugin";
import fastifyCors from "@fastify/cors";
import config from "../config/index.js";
async function corsPlugin(fastify, options) {
  await fastify.register(fastifyCors, {
    origin: config.cors.origin,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: config.cors.credentials,
  });
}

export default fp(corsPlugin);
