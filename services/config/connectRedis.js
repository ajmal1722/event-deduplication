import Redis from "ioredis";

let redisClient;
let redisSub;

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisOptions = {
    retryStrategy: (times) => Math.min(times * 100, 2000),
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    autoResubscribe: true,
    reconnectOnError: () => true,
};

const createRedis = () => new Redis(redisUrl, redisOptions);

export const connectRedis = () => {
    if (!redisClient) {
        redisClient = createRedis();

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
        redisSub = createRedis();

        redisSub.on("connect", () => {
            console.log(`✅ Redis connected (subscriber)`);
        });

        redisSub.on("error", (err) => {
            console.error("❌ Redis subscriber error:", err.message);
        });
    }
    return redisSub;
};