import kafka from "../config/kafka.js";

export default function createConsumer(groupId) {
  const consumer = kafka.consumer({
    groupId,
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    // true: lets Aiven auto-create topics on first subscribe if the admin API
    // creation was blocked by Aiven's policy (POLICY_VIOLATION on free plan).
    allowAutoTopicCreation: true,
  });

  return consumer;
}
