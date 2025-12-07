const Transaction = require('../models/transactionModel');
const addBudgetJob = require('../workers/budgetWorkerAddJob');

exports.create = async (req, res) => {
    try {
        const payload = req.body;

        // Basic validation
        if (!payload.userId || !payload.amount) {
            return res.status(400).json({ error: 'userId and amount are required' });
        }

        // Logic to handle "Next Run Date" if recurring
        let recurringConfig = null;
        if (payload.recurring?.frequency) {
            const nextDate = new Date(payload.date);
            // If they say "Start Monthly from today", the next one is next month
            switch (payload.recurring.frequency) {
                case 'daily':
                    // Add 1 Day
                    nextDate.setDate(nextDate.getDate() + 1);
                    break;

                case 'weekly':
                    // Add 7 Days
                    nextDate.setDate(nextDate.getDate() + 7);
                    break;

                case 'monthly':
                    // Add 1 Month
                    nextDate.setMonth(nextDate.getMonth() + 1);
                    break;

                case 'yearly':
                    // Add 1 Year
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                    break;

                default:
                    // Fallback: If no valid frequency, don't set a next date
                    nextDate = null;
            }
            recurringConfig = {
                frequency: payload.recurring.frequency,
                nextRunDate: nextDate,
                isActive: true
            };
        }

        const txn = await Transaction.create({
            ...payload,
            isRecurring: !!payload.recurring,
            recurringConfig
        });
        // Push job
        // Wrap in try/catch or handle specifically if job failure shouldn't block response
        try {
            await addBudgetJob(txn);
        } catch (jobError) {
            console.error('Budget Job Error:', jobError);
        }

        res.status(201).json({ txn });
    } catch (err) {
        console.error('Create Transaction Error:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.list = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }


        // 2. Run List & Stats in Parallel (Performance Boost)
        const [txns, statsResult] = await Promise.all([
            // A. Get List (Using the query object!)
            Transaction.find({ userId })
                .sort({ date: -1 })
                .limit(200),

            // B. Get Stats (Aggregated)
            Transaction.aggregate([
                { $match: { userId } }, // Use exact same filter
                {
                    $group: {
                        _id: null,
                        totalIncome: {
                            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] }
                        },
                        totalExpense: {
                            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] }
                        }
                    }
                }
            ])
        ]);

        // 3. Format Stats
        const statsData = statsResult[0] || { totalIncome: 0, totalExpense: 0 };
        const stats = {
            income: statsData.totalIncome,
            expense: statsData.totalExpense,
            balance: statsData.totalIncome - statsData.totalExpense
        };

        // 4. Return Combined Response
        res.json({
            txns,
            stats
        });

    } catch (err) {
        console.error('List Transactions Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getFilters = async (req, res) => {
    try {
        const userId = req.userId;

        const {
            type,
            category,
            minAmount,
            maxAmount,
            startDate,
            endDate,
            search,
            page = 1,
            limit = 20,
        } = req.query;

        const filter = { userId };

        if (type) filter.type = type;
        if (category) filter.category = category;
        if (minAmount) filter.amount = { ...filter.amount, $gte: Number(minAmount) };
        if (maxAmount) filter.amount = { ...filter.amount, $lte: Number(maxAmount) };
        if (startDate) filter.date = { ...filter.date, $gte: new Date(startDate) };
        if (endDate) filter.date = { ...filter.date, $lte: new Date(endDate) };

        if (search) {
            filter.notes = { $regex: search, $options: "i" };
        }

        const skip = (page - 1) * limit;

        const transactions = await Transaction.find(filter)
            .sort({ date: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.json({ count: transactions.length, transactions });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};



exports.updateTransaction = async (req, res) => {
    try {
        const userId = req.userId;
        const txnId = req.params.id;

        const updated = await Transaction.findOneAndUpdate(
            { _id: txnId, userId },
            req.body,
            { new: true }
        );

        if (!updated) return res.status(404).json({ error: "Transaction not found" });

        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const userId = req.userId;
        const txnId = req.params.id;

        const deleted = await Transaction.findOneAndDelete({
            _id: txnId,
            userId,
        });

        if (!deleted) return res.status(404).json({ error: "Transaction not found" });

        res.json({ message: "Transaction deleted" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}