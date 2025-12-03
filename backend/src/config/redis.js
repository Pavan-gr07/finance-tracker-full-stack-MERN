const IORedis = require("ioredis");

const redisClient = new IORedis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,

    // REQUIRED FOR BULLMQ
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

module.exports = redisClient;
