import Redis from 'ioredis';

let redis;

export const connectRedis = () => {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redis = new Redis(redisUrl);

    redis.on('connect', () => {
        console.log(`✅ Connected to Redis at ${redisUrl}`);
    });

    redis.on('error', (err) => {
        console.error('❌ Redis error:', err.message);
    });

    return redis;
};

export default connectRedis;