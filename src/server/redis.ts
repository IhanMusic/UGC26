import "dotenv/config";
import IORedis from "ioredis";
import { env } from "@/server/env";

let _redis: IORedis | null = null;

export function getRedis(): IORedis {
  if (_redis) return _redis;
  if (!env.REDIS_URL) {
    throw new Error("REDIS_URL is not configured");
  }
  _redis = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });
  return _redis;
}
