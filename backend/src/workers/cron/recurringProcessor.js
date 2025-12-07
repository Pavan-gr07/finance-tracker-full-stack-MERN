// cron/recurringProcessor.js
const cron = require("node-cron");
const Transaction = require("../models/transactionModel");
const addBudgetJob = require("../budgetWorkerAddJob");

const processRecurringTransactions = async () => {
    console.log("⏰ Running Daily Recurring Check...");

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    // 1. Find all active recurring transactions where nextRunDate <= today
    const dueTransactions = await Transaction.find({
        isRecurring: true,
        "recurringConfig.isActive": true,
        "recurringConfig.nextRunDate": { $lte: today }
    });

    console.log(`Found ${dueTransactions.length} recurring transactions due.`);

    for (const original of dueTransactions) {
        // 2. Clone the transaction
        const newTxn = new Transaction({
            userId: original.userId,
            amount: original.amount,
            type: original.type,
            category: original.category,
            notes: original.notes,
            date: new Date(), // It happens TODAY
            parentTxnId: original._id, // Link to parent
            isRecurring: false // The copy itself is NOT recurring, it's a one-off instance
        });

        await newTxn.save();
        console.log(`✅ Generated recurring txn: ${newTxn._id}`);

        // 3. ⚡ CRITICAL: Trigger your EXISTING Budget Alert System
        // This is where your code connects! 
        // The alert system thinks this is just a normal new transaction.
        await addBudgetJob({ txnId: newTxn._id, userId: newTxn.userId });

        // 4. Update the "Next Run Date" of the Original
        const nextDate = new Date(original.recurringConfig.nextRunDate);

        // Calculate next date based on frequency
        if (original.recurringConfig.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
        if (original.recurringConfig.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
        if (original.recurringConfig.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
        if (original.recurringConfig.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

        original.recurringConfig.nextRunDate = nextDate;
        await original.save();
    }
};

// Schedule it to run every day at midnight (00:00)
// The cron syntax "0 0 * * *" means "At minute 0 past hour 0"
cron.schedule("0 0 * * *", () => {
    processRecurringTransactions();
});

module.exports = processRecurringTransactions;