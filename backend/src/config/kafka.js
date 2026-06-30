import { Kafka } from "kafkajs";
import config from "./index.js";


process.env.KAFKAJS_NO_PARTITIONER_WARNING = "1";


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

  connectionTimeout: 10000,
  requestTimeout: 60000,
});

export default kafka;
