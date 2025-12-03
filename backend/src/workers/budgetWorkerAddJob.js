const { Queue } = require('bullmq');
const redis = require('../config/redis');


const budgetQueue = new Queue('budget-queue', { connection: redis });


const addBudgetJob = async (txn) => {
    await budgetQueue.add('recalculateBudget', { txnId: txn._id.toString(), userId: txn.userId.toString() }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
};


module.exports = addBudgetJob