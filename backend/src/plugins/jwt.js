import fastifyJwt from "@fastify/jwt";
import fp from "fastify-plugin";
import config from "../config/index.js";

async function jwtPlugin(fastify, opt) {
  await fastify.register(fastifyJwt, {
    secret: config.security.jwtSecret,
  });
}

export default fp(jwtPlugin);
