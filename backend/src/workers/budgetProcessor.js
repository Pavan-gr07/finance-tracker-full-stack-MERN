require("dotenv").config();
const { Worker } = require("bullmq");
const IORedis = require("ioredis"); // <--- CHANGE 1: Import ioredis
const connectDB = require("../config/db");
const Transaction = require("../models/transactionModel");
const Budget = require("../models/budgetModel");
const Notification = require("../models/notificationModel");

(async () => {
    await connectDB();

    // <--- CHANGE 2: Create a dedicated connection for the Worker
    const connection = new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null, // Mandatory for BullMQ
        tls: {
            rejectUnauthorized: false // Mandatory for Upstash
        }
    });

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

                // Check thresholds
                for (const threshold of budget.notifyAtPercent) {
                    if (percentUsed >= threshold) {
                        // Logic to prevent duplicate alerts should ideally go here
                        // e.g., check if we already alerted for this threshold this month

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
                        console.log(`🔔 Alert Sent: ${percentUsed}% used`);
                    }
                }
            }
        },
        {
            connection: connection // <--- CHANGE 3: Use the ioredis connection
        }
    );

    // Listen for events to debug
    worker.on('ready', () => console.log("✅ Worker is connected and ready!"));
    worker.on('failed', (job, err) => console.log(`❌ Job ${job.id} failed:`, err));
    worker.on('error', err => console.error("❌ Worker Error:", err));

    console.log("🚀 Budget Processor Started...");
})();