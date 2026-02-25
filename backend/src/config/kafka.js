import { Kafka } from "kafkajs";
import config from "./index.js";

const kafka = new Kafka({
  clientId: "lt-backend",
  brokers: [config.kafka.broker],
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
  connectionTimeout: 3000,
  requestTimeout: 30000,
});

export default kafka;
