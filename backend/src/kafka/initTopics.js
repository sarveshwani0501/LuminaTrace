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
        replicationFactor: 1,
        configEntries: [
          { name: "retention.ms", value: "604800000" },      // 7 days
          { name: "compression.type", value: "snappy" },
          { name: "max.message.bytes", value: "1048576" },   // 1MB
        ],
      },
      {
        topic: topics.METRICS,
        numPartitions: 3,
        replicationFactor: 1,
        configEntries: [
          { name: "retention.ms", value: "2592000000" },     // 30 days
          { name: "compression.type", value: "snappy" },
          { name: "max.message.bytes", value: "1048576" },
        ],
      },
      {
        topic: topics.SPANS,
        numPartitions: 3,
        replicationFactor: 1,
        configEntries: [
          { name: "retention.ms", value: "604800000" },      // 7 days
          { name: "compression.type", value: "snappy" },
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
