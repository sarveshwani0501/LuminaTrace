import pino from "pino";
import config from "../config/index.js";

const logger = pino({
  level: config.logging.level,
  transport:
    config.app.env === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
          },
        }
      : undefined,
});

export default logger;
