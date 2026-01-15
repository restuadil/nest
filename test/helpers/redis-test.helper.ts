import Redis from "ioredis";
const redis = new Redis({
  host: "localhost",
  port: 6379,
});

export async function flushRedis() {
  await redis.flushall();
}
