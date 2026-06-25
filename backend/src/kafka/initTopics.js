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
      // Aiven free plan actual limits (confirmed from console):
      // partitions: 1, replication factor: 2, min ISR: 1
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
      // ── POLICY_VIOLATION handling ──────────────────────────────────────────
      // Aiven free plan blocks programmatic topic creation via the admin API.
      // This is NOT a fatal error — the app can still start. Topics must be
      // created manually in the Aiven console.
      //
      // HOW TO FIX: Go to Aiven → your Kafka service → Topics tab → create:
      //   • luminatrace.logs     (partitions: 3, replication: 3)
      //   • luminatrace.metrics  (partitions: 3, replication: 3)
      //   • luminatrace.spans    (partitions: 3, replication: 3)
      //
      // Once created, the app will skip this block on next startup.
      // ──────────────────────────────────────────────────────────────────────
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
