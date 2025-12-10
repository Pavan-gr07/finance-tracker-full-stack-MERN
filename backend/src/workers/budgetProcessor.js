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
            console.log("🔄 Processing Job:", job.id, "for Transaction:", txnId);

            const txn = await Transaction.findById(txnId);
            if (!txn) {
                console.log("❌ Transaction not found, skipping.");
                return;
            }

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

                console.log(`📊 Budget: ${budget.category} | Used: ${percentUsed}%`);
                const sortedThresholds = budget.notifyAtPercent.sort((a, b) => b - a);
                for (const threshold of sortedThresholds) {
                    if (percentUsed >= threshold) {

                        // 1. CHECK DATABASE: Did we already send an alert for this specific budget & threshold this month?
                        // (You need a way to track this. For now, let's assume you just want to avoid 3 alerts in one go)

                        console.log(`Checking threshold: ${threshold}%`);

                        // Check if a notification for this budget & threshold exists for the current month
                        const startOfMonth = new Date();
                        startOfMonth.setDate(1);
                        startOfMonth.setHours(0, 0, 0, 0);

                        const existingAlert = await Notification.findOne({
                            userId: userId,
                            "payload.budgetId": budget._id,
                            "payload.percent": { $gte: threshold }, // Check if we already alerted for this tier or higher
                            createdAt: { $gte: startOfMonth }
                        });

                        if (existingAlert) {
                            console.log(`🔕 Alert already sent for ${threshold}% or higher this month. Skipping.`);
                            break; // Stop checking lower thresholds
                        }

                        // 2. Create the Notification
                        await Notification.create({
                            userId,
                            type: "budget_alert",
                            payload: {
                                budgetId: budget._id,
                                limit: budget.limit,
                                spent: totalSpent,
                                percent: percentUsed,
                                thresholdMet: threshold
                            },
                        });

                        console.log(`🔔 Alert Sent for exceeding ${threshold}%`);

                        // 3. IMPORTANT: Break the loop!
                        // We found the highest exceeded threshold. We don't need to alert for 80% and 50% too.
                        break;
                    }
                }
            }
        },
        {
            connection: redisClient // <--- CHANGE 3: Use the ioredis connection
        }
    );

    // Listen for events to debug
    worker.on('ready', () => console.log("✅ Worker is connected and ready!"));
    worker.on('failed', (job, err) => console.log(`❌ Job ${job.id} failed:`, err));
    worker.on('error', err => console.error("❌ Worker Error:", err));

    console.log("🚀 Budget Processor Started...");
})();