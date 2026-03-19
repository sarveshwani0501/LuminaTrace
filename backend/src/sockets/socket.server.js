import { Server } from "socket.io";
import config from "../config/index.js";
import { socketAuthMiddleware } from "./socket.auth.js";
import { verifyProjectAccess } from "../utils/authorization.js";
import logger from "../utils/logger.js";

export function initializeSocketServer(fastify) {
  const io = new Server(fastify.server, {
    cors: {
      origin: config.cors.origin,
      credentials: true,
    },
  });

  // middleware for authenticating user
  io.use(socketAuthMiddleware(fastify));


  // establising connection with client

  io.on("connection", (socket) => {
    logger.info(
      {
        userId: socket.userId,
        socketId: socket.id,
      },
      "User connected via web sockets",
    );
    // joining project room 
    socket.on("join_project", async (projectId) => {
      try {
        if (!projectId || typeof projectId !== "string") {
          socket.emit("error", { message: "Invalid project ID" });
          return;
        }

        const hasAccess = await verifyProjectAccess(socket.userId, projectId);

        if (!hasAccess) {
          socket.emit("error", { message: "Access denied to this project" });
          logger.warn({ userId: socket.userId, projectId });
          return;
        }

        // joining the room

        socket.join(`project:${projectId}`);

        logger.info(
          {
            userId: socket.userId,
            projectId,
          },
          "User joined project room",
        );
        // sending joined confirmation to client
        socket.emit("joined_project", { projectId });
      } catch (err) {
        logger.error({ err, projectId }, "Error joining project room");
        socket.emit("error", { message: "Failed to join project" });
      }
    });
    

    // leaving the project room
    socket.on("leave_project", (projectId) => {
      try {
        if (!projectId || typeof projectId != "string") {
          return;
        }
        //
        socket.leave(`project:${projectId}`);
        //
        logger.info(
          {
            userId: socket.userId,
            projectId,
          },
          "User left the project room",
        );

        socket.emit("left-project", { projectId });
      } catch (err) {
        logger.error({ err, projectId }, "Error leaving project room");
      }
    });

    // Disconnecting connection with the client
    socket.on("disconnect", (reason) => {
      logger.info(
        {
          userId: socket.userId,
          socketId: socket.id,
          reason,
        },
        "User disconnected",
      );
    });

    // In case of error
    socket.on("error", (err) => {
      logger.error({ err, userId: socket.userId }, "Socket error");
    });
  });

  logger.info("Socket Server initialized");

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error(
      "Socket.io is initialized. Call initializeSocketServer first",
    );
  }
  return io;
}
