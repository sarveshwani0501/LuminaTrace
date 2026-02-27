import { validateAPIKey } from "../modules/ingest/ingestService.js";
import logger from "../utils/logger.js";
const authenticateKey = async (req, reply) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) {
      return reply.code(401).send({
        error: "Unauthorized",
        message: "API Key is required",
      });
    }

    const projectId = await validateAPIKey(apiKey);
    if (projectId == null) {
      return reply.code(401).send({
        error: "Unauthorized",
        message: "Invalid API Key",
      });
    }
    logger.info({ projectId }, "API Key Validated");
    req.projectId = projectId;
  } catch (err) {
    logger.error({ err }, "Error occured while authenticating key");
    return reply.code(500).send({
      error: "Internal Server Error",
      message: "Authentication failed",
    });
  }
};

export default authenticateKey;
