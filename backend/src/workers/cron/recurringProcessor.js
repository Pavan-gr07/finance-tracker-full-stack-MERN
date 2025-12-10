const cron = require("node-cron");
const Transaction = require("../../models/transactionModel");
const addBudgetJob = require("../budgetWorkerAddJob"); // Ensure path is correct

const processRecurringTransactions = async () => {
    console.log("⏰ Running Daily Recurring Check...");

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueTransactions = await Transaction.find({
            isRecurring: true,
            "recurringConfig.isActive": true,
            "recurringConfig.nextRunDate": { $lte: today }
        });

        console.log(`Found ${dueTransactions.length} recurring transactions due.`);

        for (const original of dueTransactions) {
            const newTxn = new Transaction({
                userId: original.userId,
                amount: original.amount,
                type: original.type,
                category: original.category,
                notes: original.notes,
                date: new Date(),
                parentTxnId: original._id,
                isRecurring: false
            });

            await newTxn.save();
            console.log(`✅ Generated recurring txn: ${newTxn._id}`);

            // ✅ FIX: Pass the full object
            await addBudgetJob(newTxn);

            // Update Next Run Date
            const nextDate = new Date(original.recurringConfig.nextRunDate);
            if (original.recurringConfig.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
            if (original.recurringConfig.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
            if (original.recurringConfig.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
            if (original.recurringConfig.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

            original.recurringConfig.nextRunDate = nextDate;
            await original.save();
        }
    } catch (error) {
        console.error("❌ Error in Recurring Processor:", error);
    }
};

// Schedule: Runs every minute for testing (Change back to '0 0 * * *' later)
cron.schedule("* * * * *", () => {
    processRecurringTransactions();
});

module.exports = processRecurringTransactions;