import logger from "../utils/logger.js";
import cookie from "cookie";
import jwt from "jsonwebtoken";

export function socketAuthMiddleware(fastify) {
  return async function (socket, next) {
    try {
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) {
        logger.warn("Web Socket trying to make a connection without cookies");
        return next(new Error("Authentication required"));
      }

      const parsedCookies = cookie.parse(cookies);

      const token = parsedCookies.token;

      if (!token) {
        logger.warn("WebSocket connection attempt without auth token");
        return next(new Error("Authentication token not found"));
      }

      const decoded = fastify.jwt.verify(token);

      socket.userId = decoded.userId;

      socket.email = decoded.email;

      logger.debug({ userId: decoded.userId }, "WebSocket Authenticated");

      next();
    } catch (err) {
      if (err.name === "JsonWebTokenError") {
        logger.warn(
          { error: err.message },
          "Invalid JWT token in WebSocket handshake",
        );
      }
      
      if (err.name === "TokenExpiredError") {
        logger.warn("Expired JWT token in WebSocket handshake");
        return next(new Error("Authentication token expired"));
      }

      logger.error({ err }, "Socket authentication error");
      return next(new Error("Authentication failed"));
    }
  };
}
