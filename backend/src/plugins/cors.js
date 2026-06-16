import fp from "fastify-plugin";
import fastifyCors from "@fastify/cors";
import config from "../config/index.js";
async function corsPlugin(fastify, options) {
  await fastify.register(fastifyCors, {
    origin: (origin, cb) => {
      // 1. Allow server-to-server requests or curl (no origin header)
      if (!origin) {
        return cb(null, true);
      }

      // 2. Check against allowed origins
      const allowedOrigins = config.cors.origin;
      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      // 3. IF IT FAILS, LOG EXACTLY WHY:
      fastify.log.error(
        { incomingOrigin: origin, allowedOrigins },
        "CORS BLOCKED: Incoming origin does not match allowed origins"
      );
      
      // Still return false to reject it, but now we know why
      cb(new Error("Not allowed by CORS"), false);
    },
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    credentials: config.cors.credentials,
  });
}

export default fp(corsPlugin);
