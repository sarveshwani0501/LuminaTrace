import kafka from "../config/kafka.js";

export default function createConsumer(groupID) {
  const consumer = kafka.consumer({
    groupID,
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    allowAutoTopicCreation: false,
  });

  return consumer;
}

//export default createConsumer;
