import { Redis } from "ioredis";
import logger from "../utils/logger";
import config from "./index.js";

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
  maxRetriesPerRequest: 2,
});

redis.on("connect", () => {
  logger.info("Connected to redis");
});

redis.on("error", (err) => {
  logger.error("Redis Error", err);
});

redis.on("close", () => {
  logger.warn("Redis connection closed");
});

export async function getJSON(key) {
  const val = await redis.get(key);
  return val ? JSON.parse(val) : null;
}

export async function setJSON(key, value, ttlSeconds = null) {
  const serializedVal = JSON.stringify(value);
  if (ttlSeconds) {
    await redis.set(key, serializedVal, "EX", ttlSeconds);
  } else {
    await redis.set(key, serializedVal);
  }
}

export async function incrementHashField(key, field, amount) {
  if (Number.isInteger(amount)) {
    await redis.hincrby(key, field, amount);
  } else {
    await redis.hincrbyfloat(key, field, amount);
  }
}

// will help to get all fields using the key

export async function getHash(key) {
  return await redis.hgetall(key);
}

export async function setExpiryOnKey(key, seconds) {
  return await redis.expire(key, seconds);
}

export async function pushAndTrim(key, value, maxLen) {
  // since two things to be done we can avoid two separate network trips
  // means both commands will run over a single network trip
  // for that we crate a pipeline
  const pipeline = redis.pipeline();

  pipeline.lpush(key, value);

  pipeline.ltrim(key, 0, maxLen - 1);

  return await pipeline.exec();
}

export async function getListItems(key, start = 0, end = -1) {
  return await redis.lrange(key, start, end);
}

// for shared resources  we need to use to use redis distributed locks system

export async function acquireLock(lockKey, ttlSeconds = 60) {
  const result = await redis.set(lockKey, "locked", "NX", "EX", ttlSeconds);
  return result === "OK";
}

export async function releaseLock(lockKey) {
  return await redis.del(lockKey);
}

export default redis;
