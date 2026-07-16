import { send } from "../kafka/producer.js";
import { topics } from "../kafka/topics.js";
import logger from "../utils/logger.js";



const HEARTBEAT_INTERVAL_MS = 12 * 60 * 60 * 1000; 

export function scheduleKafkaHeartbeat() {
  
  sendHeartbeat();
  setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
  logger.info("Kafka heartbeat job scheduled (every 12 hours)");
}

async function sendHeartbeat() {
  try {
    await send(topics.LOGS, {
      projectId: "heartbeat",
      level: "DEBUG",
      message: "__kafka_heartbeat__",
      timestamp: new Date().toISOString(),
      metadata: { source: "heartbeat_job" },
    });
    logger.debug("Kafka heartbeat sent successfully");
  } catch (err) {
    
    logger.warn({ err }, "Kafka heartbeat failed to send");
  }
}
