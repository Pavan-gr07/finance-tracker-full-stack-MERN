const cron = require("node-cron");
const Transaction = require("../../models/transactionModel");
const Budget = require("../../models/budgetModel");
const Notification = require("../../models/notificationModel");
const User = require("../../models/userModel"); // Assuming you have a User model

const runSmartChecks = async () => {
    console.log("🧠 Running Smart Notification Checks...");

    try {
        // --- FEATURE 1: BUDGET EDUCATION (Onboarding) ---
        // Logic: Find users with Transactions but NO Budgets
        // We only want to notify them once.

        // 1. Get all users
        const users = await User.find({});

        for (const user of users) {
            // Check if user has transactions
            const txnCount = await Transaction.countDocuments({ userId: user._id });
            if (txnCount === 0) continue; // Skip new users who haven't done anything yet

            // Check if user has budgets
            const budgetCount = await Budget.countDocuments({ userId: user._id });

            if (budgetCount === 0) {
                // Check if we already sent the education alert
                const alreadyNotified = await Notification.exists({
                    userId: user._id,
                    type: "education_budget"
                });

                if (!alreadyNotified) {
                    await Notification.create({
                        userId: user._id,
                        type: "education_budget", // Custom type for frontend icon
                        title: "💡 Smart Tip: Set a Budget",
                        message: "You've started tracking expenses! Create a budget now to keep your spending in check.",
                        isRead: false
                    });
                    console.log(`💡 Sent Budget Education to user ${user._id}`);
                }
            }
        }

        // --- FEATURE 2: SAVINGS NUDGE (Income Check) ---
        // Logic: Check income transactions from YESTERDAY. 
        // If category is "Savings", nudge them about goals.

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const endOfYesterday = new Date(yesterday);
        endOfYesterday.setHours(23, 59, 59, 999);

        const incomeTxns = await Transaction.find({
            type: 'income',
            date: { $gte: yesterday, $lte: endOfYesterday },
            // You can adjust these categories based on your app
            category: { $in: ['Savings', 'Investments', 'Bonus'] }
        });

        for (const txn of incomeTxns) {
            // Avoid duplicate alerts for the same transaction
            const alreadyAlerted = await Notification.exists({
                userId: txn.userId,
                "payload.relatedTxnId": txn._id
            });

            if (!alreadyAlerted) {
                await Notification.create({
                    userId: txn.userId,
                    type: "goal_nudge",
                    title: "🎉 Nice Saving!",
                    message: `You saved ${txn.amount}! Do you want to allocate this towards a Goal?`,
                    payload: { relatedTxnId: txn._id }, // Link to txn so we don't alert twice
                    isRead: false
                });
                console.log(`🎉 Sent Savings Nudge to user ${txn.userId}`);
            }
        }

    } catch (error) {
        console.error("❌ Smart Notification Error:", error);
    }
};

// Schedule: Run every morning at 9:00 AM
cron.schedule("0 9 * * *", () => {
    runSmartChecks();
});

module.exports = runSmartChecks;