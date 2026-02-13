// Example: How to use the config module

import config from "./src/config/index.js";

// Access application settings
console.log("Running on port:", config.app.port);
console.log("Environment:", config.app.env);

// Access database settings
console.log("Database URL:", config.database.url);
console.log("Database host:", config.database.host);

// Access Redis settings
console.log("Redis host:", config.redis.host);

// Access Kafka settings
console.log("Kafka broker:", config.kafka.broker);

// Access security settings
const token = signJWT(payload, config.security.jwtSecret);

// Access API settings
const rateLimit = config.api.rateLimit;

// Access feature flags
if (config.features.enableMetrics) {
  // Initialize metrics collection
}

// Use in database connection
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  max: config.database.pool.max,
  min: config.database.pool.min,
  idleTimeoutMillis: config.database.pool.idle,
});

// Use in Redis connection
import Redis from "ioredis";

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
});

// Use in Kafka connection
import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: [config.kafka.broker],
});
