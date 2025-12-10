
const IORedis = require('ioredis'); // <--- Import ioredis

// 1. Create a dedicated connection for BullMQ
// We use the same REDIS_URL but must configure it for Upstash + BullMQ
const redisClient = new IORedis(process.env.REDIS_URL, {
    // CRITICAL: BullMQ will crash without this
    maxRetriesPerRequest: null,

    // CRITICAL: Required for Upstash (Secure connection)
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = redisClient;