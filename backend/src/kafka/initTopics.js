import kafka from "../config/kafka.js";
import { topics } from "./topics.js";
import logger from "../utils/logger.js";

export async function initializeTopics() {
  const admin = kafka.admin();
  try {
    await admin.connect();

    const existingTopics = await admin.listTopics();
    logger.info({ existingTopics }, "Listed existing Kafka topics");

    const requiredTopics = [topics.LOGS, topics.METRICS, topics.SPANS];
    const missingTopics = requiredTopics.filter(
      (t) => !existingTopics.includes(t),
    );

    if (missingTopics.length === 0) {
      logger.info("All required Kafka topics already exist — skipping creation");
      return;
    }

    const topicsToCreate = missingTopics.map((topic) => ({
      topic,
      
      numPartitions: 1,
      replicationFactor: 2,
    }));

    try {
      await admin.createTopics({ topics: topicsToCreate, waitForLeaders: true });
      logger.info(
        { topics: topicsToCreate.map((t) => t.topic) },
        "Kafka topics created successfully",
      );
    } catch (createError) {
      
      logger.warn(
        {
          error: createError.message,
          missingTopics,
          action:
            "Create these topics manually in Aiven console → Kafka service → Topics",
        },
        "Could not auto-create Kafka topics (Aiven policy restriction). " +
          "App will start — workers may fail until topics exist in Aiven console.",
      );
    }
  } catch (error) {
    // Only truly fatal if we can't even connect to the broker at all.
    logger.error({ error }, "Failed to connect to Kafka admin — aborting startup");
    throw error;
  } finally {
    await admin.disconnect();
  }
}
