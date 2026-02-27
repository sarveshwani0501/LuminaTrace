// import kafka from "../config/kafka.js";
// import logger from "../utils/logger.js";
// import { topics } from "./topics.js";

// const admin = kafka.admin();

// const topicConfigs = [
//   {
//     topic: topics.LOGS,
//     numPartitions: 3,
//     replicationFactor: 1, // Single broker, use 1. Production: use 3
//     configEntries: [
//       { name: "retention.ms", value: "604800000" }, // 7 days
//       { name: "compression.type", value: "snappy" },
//       { name: "max.message.bytes", value: "1048576" }, // 1MB
//     ],
//   },
//   {
//     topic: topics.METRICS,
//     numPartitions: 3,
//     replicationFactor: 1,
//     configEntries: [
//       { name: "retention.ms", value: "2592000000" }, // 30 days
//       { name: "compression.type", value: "snappy" },
//       { name: "max.message.bytes", value: "1048576" },
//     ],
//   },
// ];

// export async function initializeTopics() {
//   try {
//     await admin.connect();
//     logger.info("Connected to Kafka admin");

//     // Get existing topics
//     const existingTopics = await admin.listTopics();
//     logger.info({ existingTopics }, "Existing Kafka topics");

//     // Create topics that don't exist
//     const topicsToCreate = topicConfigs.filter(
//       (config) => !existingTopics.includes(config.topic),
//     );

//     if (topicsToCreate.length > 0) {
//       await admin.createTopics({
//         topics: topicsToCreate,
//         waitForLeaders: true,
//       });
//       logger.info(
//         { topics: topicsToCreate.map((t) => t.topic) },
//         "Topics created successfully",
//       );
//     } else {
//       logger.info("All topics already exist");
//     }

//     await admin.disconnect();
//   } catch (error) {
//     logger.error({ error }, "Failed to initialize topics");
//     throw error;
//   }
// }

// for production
