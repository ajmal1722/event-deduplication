import Redis from "ioredis";

let redisClient;
let redisSub;

export const connectRedis = () => {
    if (!redisClient) {
        const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
        redisClient = new Redis(redisUrl);

        redisClient.on("connect", () => {
            console.log(`✅ Redis connected (client)`);
        });

        redisClient.on("error", (err) => {
            console.error("❌ Redis client error:", err.message);
        });
    }
    return redisClient;
};

export const connectRedisSubscriber = () => {
    if (!redisSub) {
        const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
        redisSub = new Redis(redisUrl);

        redisSub.on("connect", () => {
            console.log(`✅ Redis connected (subscriber)`);
        });

        redisSub.on("error", (err) => {
            console.error("❌ Redis subscriber error:", err.message);
        });
    }
    return redisSub;
};