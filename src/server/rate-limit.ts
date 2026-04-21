import type { NextRequest } from "next/server";
import { getRedis } from "@/server/redis";

export type RateLimitOptions = {
  keyPrefix: string;
  limit: number;
  windowSeconds: number;
  identifier?: string;
};

export async function rateLimit(req: NextRequest, opts: RateLimitOptions) {
  const redis = getRedis();
  const ip =
    opts.identifier ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  const key = `${opts.keyPrefix}:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, opts.windowSeconds);
  }

  const allowed = count <= opts.limit;
  return {
    allowed,
    limit: opts.limit,
    remaining: Math.max(0, opts.limit - count),
    resetSeconds: opts.windowSeconds,
  };
}
