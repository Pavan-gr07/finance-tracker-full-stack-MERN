// services/budgetQueue.js (or wherever this file is)
const { Queue } = require('bullmq');
const redisConnection = require('../config/redis'); // <--- Import the dedicated config

// Initialize Queue with the imported connection
const budgetQueue = new Queue('budget-queue', { connection: redisConnection });

const addBudgetJob = async (txn) => {
    const uniqueJobId = txn._id.toString();

    // 1. LOG THE ID
    console.log("🛑 Attempting to add Job ID:", uniqueJobId);

    await budgetQueue.add(
        'recalculateBudget',
        { txnId: uniqueJobId, userId: txn.userId.toString() },
        {
            // 2. ENSURE jobId IS HERE (3rd Argument)
            jobId: uniqueJobId,
            attempts: 1,
            backoff: { type: 'exponential', delay: 1000 },

            // 3. CRITICAL: Keep job history for a bit so BullMQ knows it exists
            // If you set these to true, the job vanishes instantly after finishing,
            // allowing a duplicate with the same ID to enter immediately after.
            removeOnComplete: false,
            removeOnFail: false
        }
    );
};

module.exports = addBudgetJob;