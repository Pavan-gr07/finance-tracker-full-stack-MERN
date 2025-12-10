// config/redisBull.js
require('dotenv').config();
const IORedis = require('ioredis');

const connection = new IORedis(process.env.REDIS_URL, {
    // 1. Mandatory for BullMQ to avoid crashes
    maxRetriesPerRequest: null,

    // 2. Required for Upstash (Secure connection)
    tls: {
        rejectUnauthorized: false
    }
});

connection.on('error', (err) => console.error('❌ BullMQ Redis Error:', err.message));
connection.on('connect', () => console.log('✅ BullMQ Redis Connected'));

module.exports = connection;