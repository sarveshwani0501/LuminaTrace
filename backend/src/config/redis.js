import { Redis as UpstashRedis } from "@upstash/redis";
import { Redis as IoRedis } from "ioredis";
import logger from "../utils/logger.js";
import config from "./index.js";



let redis;

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  const client = new UpstashRedis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

 
  client.quit = async () => {};
  client.on = () => {};

  logger.info("Redis: using Upstash REST client");
  redis = client;
} else {
 
  const client = new IoRedis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    maxRetriesPerRequest: 2,
  });

  client.on("connect", () => logger.info("Connected to Redis"));
  client.on("error", (err) => logger.error("Redis Error", err));
  client.on("close", () => logger.warn("Redis connection closed"));

  redis = client;
}



export async function getJSON(key) {
  const val = await redis.get(key);
  return val ? JSON.parse(val) : null;
}

export async function setJSON(key, value, ttlSeconds = null) {
  const serializedVal = JSON.stringify(value);
  if (ttlSeconds) {
    await redis.set(key, serializedVal, { ex: ttlSeconds });
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


export async function getHash(key) {
  return await redis.hgetall(key);
}

export async function setExpiryOnKey(key, seconds) {
  return await redis.expire(key, seconds);
}

export async function pushAndTrim(key, value, maxLen) {
 
  const pipeline = redis.pipeline();
  pipeline.lpush(key, value);
  pipeline.ltrim(key, 0, maxLen - 1);
  return await pipeline.exec();
}

export async function getListItems(key, start = 0, end = -1) {
  return await redis.lrange(key, start, end);
}


export async function acquireLock(lockKey, ttlSeconds = 60) {
  const result = await redis.set(lockKey, "locked", {
    nx: true,  
    ex: ttlSeconds,
  });
 
  return result === "OK";
}

export async function releaseLock(lockKey) {
  return await redis.del(lockKey);
}

export default redis;