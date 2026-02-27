import kafka from "../config/kafka.js";
import logger from "../utils/logger.js";

const producer = kafka.producer();

let isConnected = false;

export async function connectProducer() {
  if (isConnected) {
    return;
  }
  try {
    await producer.connect();
    isConnected = true;
    logger.info("Kafka Producer connected");
  } catch (err) {
    logger.error({ err }, "Producer failed to connect");
    throw err;
  }
}

export async function disconnectProducer() {
  if (!isConnected) return;
  try {
    await producer.disconnect();
    isConnected = false;
    logger.info("Producer disconnected successfully");
  } catch (err) {
    logger.error({ err }, "Producer failed to disconnect");
  }
}

export function isProducerConnected() {
  return isConnected;
}

export async function send(topic, messages) {
  if (!isConnected) {
    throw new Error("Kafka producer not connected");
  }

  // we need to check if the messages is an array or not because kafka needs messages array
  const messagesArray = Array.isArray(messages) ? messages : [messages];

  // now we need to make it according to our format because message structure is --> {key, value, partition, timestamp, headers}
  const kafkaMsgs = messagesArray.map((msg) => ({
    key: msg.projectId ? msg.projectId.toString() : null,
    value: JSON.stringify(msg),
    timestamp: Date.now().toString(),
  }));

  try {
    await producer.send({
      topic: topic,
      messages: kafkaMsgs,
    });
    logger.debug({ topic, count: kafkaMsgs.length }, "Messages sent to kafka");
  } catch (err) {
    logger.error({ topic, err }, "Failed to send messages");
    throw err;
  }
}

export default producer;
