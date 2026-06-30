import kafka from "../config/kafka.js";

export default function createConsumer(groupId) {
  const consumer = kafka.consumer({
    groupId,
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
  
    allowAutoTopicCreation: true,
  });

  return consumer;
}
