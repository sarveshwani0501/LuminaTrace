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
        // configEntries are intentionally omitted: Aiven's managed cluster
        // throws POLICY_VIOLATION (code 44) if you try to set retention.ms,
        // max.message.bytes, or any per-topic config via the admin API.
        // Aiven governs these exclusively at the cluster/broker policy level.
        replicationFactor: 3,
      },
      {
        topic: topics.METRICS,
        numPartitions: 3,
        replicationFactor: 3,
      },
      {
        topic: topics.SPANS,
        numPartitions: 3,
        replicationFactor: 3,
      },
    ].filter((t) => !existingTopics.includes(t.topic)); // Skip if already exists

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
