import kafka from "../config/kafka.js";
import { topics } from "./topics.js";

export async function initializeTopics() {
  const admin = kafka.admin();
  try {
    await admin.connect();

    const existingTopics = await admin.listTopics();

    const topicsToCreate = [
      {
        topic: topics.LOGS,
        numPartitions: 3,
        // Aiven free cluster has 3 brokers — replicationFactor must be 3.
        // RF=1 is rejected by Aiven's min.insync.replicas enforcement.
        replicationFactor: 3,
        configEntries: [
          { name: "retention.ms", value: "604800000" },     // 7 days
          // snappy compression is NOT settable via admin API on Aiven managed
          // clusters — the broker enforces it at the cluster level and rejects
          // per-topic overrides with an InvalidConfigurationException.
          { name: "max.message.bytes", value: "1048576" },  // 1MB
        ],
      },
      {
        topic: topics.METRICS,
        numPartitions: 3,
        replicationFactor: 3,
        configEntries: [
          { name: "retention.ms", value: "2592000000" },    // 30 days
          { name: "max.message.bytes", value: "1048576" },
        ],
      },
      {
        topic: topics.SPANS,
        numPartitions: 3,
        replicationFactor: 3,
        configEntries: [
          { name: "retention.ms", value: "604800000" },     // 7 days
          { name: "max.message.bytes", value: "1048576" },
        ],
      },
    ].filter((t) => !existingTopics.includes(t.topic));     // Skip if already exists

    if (topicsToCreate.length > 0) {
      await admin.createTopics({ topics: topicsToCreate, waitForLeaders: true });
      console.log("Kafka topics created:", topicsToCreate.map((t) => t.topic));
    } else {
      console.log("All Kafka topics already exist.");
    }
  } catch (error) {
    console.error("Failed to initialize Kafka topics:", error);
    throw error; 
  } finally {
    await admin.disconnect();
  }
}
