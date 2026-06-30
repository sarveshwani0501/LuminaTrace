import fp from "fastify-plugin";
import fastifyCors from "@fastify/cors";
import config from "../config/index.js";
async function corsPlugin(fastify, options) {
  await fastify.register(fastifyCors, {
    origin: (origin, cb) => {
      if (!origin) {
        return cb(null, true);
      }

     
      const allowedOrigins = config.cors.origin;
      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      
      fastify.log.error(
        { incomingOrigin: origin, allowedOrigins },
        "CORS BLOCKED: Incoming origin does not match allowed origins"
      );
      
      cb(new Error("Not allowed by CORS"), false);
    },
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    credentials: config.cors.credentials,
  });
}

export default fp(corsPlugin);
