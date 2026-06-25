import { Kafka } from "kafkajs";
import config from "./index.js";

// Suppress the KafkaJS v2 partitioner warning — we accept the new default
// and don't need the migration reminder on every startup.
process.env.KAFKAJS_NO_PARTITIONER_WARNING = "1";

// Aiven (production) requires SSL with mutual TLS (client cert + key + CA).
// Certs are stored as env vars because Render does not support file uploads.
// Local Docker Kafka runs plain PLAINTEXT — no SSL needed.
const sslConfig = process.env.KAFKA_CA_CERT
  ? {
      rejectUnauthorized: true,
      ca: [process.env.KAFKA_CA_CERT],
      cert: process.env.KAFKA_CLIENT_CERT,
      key: process.env.KAFKA_CLIENT_KEY,
    }
  : false;

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: [config.kafka.broker],
  ssl: sslConfig,
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
  // Higher timeouts than local Docker — cloud Aiven has real network latency.
  // 3000ms connectionTimeout caused immediate failures on Render → Aiven path.
  connectionTimeout: 10000,
  requestTimeout: 60000,
});

export default kafka;
