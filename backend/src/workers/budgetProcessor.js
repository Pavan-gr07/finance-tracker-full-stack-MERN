require("dotenv").config();
const { Worker } = require("bullmq");
const redisClient = require("../config/redis");
const connectDB = require("../config/db");
const Transaction = require("../models/transactionModel");
const Budget = require("../models/budgetModel");
const Notification = require("../models/notificationModel");

(async () => {
    await connectDB();

    const worker = new Worker(
        "budget-queue",
        async (job) => {
            const { txnId, userId } = job.data;

            console.log("Recalculating budget for new transaction:", txnId);

            const txn = await Transaction.findById(txnId);
            if (!txn) return;

            // Get budgets for this user
            const budgets = await Budget.find({ userId });

            for (const budget of budgets) {
                // Calculate total spent this month
                const start = new Date();
                start.setDate(1);
                start.setHours(0, 0, 0, 0);

                const spent = await Transaction.aggregate([
                    {
                        $match: {
                            userId: budget.userId,
                            category: budget.category,
                            type: "expense",
                            date: { $gte: start },
                        },
                    },
                    { $group: { _id: null, total: { $sum: "$amount" } } },
                ]);

                const totalSpent = spent[0]?.total || 0;
                const percentUsed = Math.round((totalSpent / budget.limit) * 100);

                // Check thresholds
                for (const threshold of budget.notifyAtPercent) {
                    if (percentUsed >= threshold) {
                        await Notification.create({
                            userId,
                            type: "budget_alert",
                            payload: {
                                budgetId: budget._id,
                                limit: budget.limit,
                                spent: totalSpent,
                                percent: percentUsed,
                            },
                        });

                        console.log(`Budget Alert: ${percentUsed}% used`);
                    }
                }
            }
        },
        { connection: redisClient }
    );

    console.log("Budget Processor Running...");
})();
