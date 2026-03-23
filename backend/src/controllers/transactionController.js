const mongoose = require("mongoose");
const Transaction = require('../models/transactionModel');
const addBudgetJob = require('../workers/budgetWorkerAddJob');
const Goal = require("../models/goalModel");
const Budget = require("../models/budgetModel");

exports.create = async (req, res) => {
    try {
        const userId = req.userId;
        console.log(userId)
        const payload = req.body;

        // Basic validation
        if (!userId || !payload.amount) {
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
            userId,
            isRecurring: !!payload.recurring,
            recurringConfig
        });

        // 3. ⚡ THE MAGIC PART: Update the Goal
        // If this is a Savings transaction and linked to a goal, add the money to the goal
        // if (payload.category === 'Savings' && payload.linkedGoalId) {
        //     await Goal.findByIdAndUpdate(
        //         payload.linkedGoalId,
        //         {
        //             $inc: { savedAmount: payload.amount } // $inc atomically adds the amount
        //         },
        //         { new: true }
        //     );
        //     console.log(`💰 Added ${payload.amount} to Goal ${payload.linkedGoalId}`);
        // }
        // if (payload.type === 'expense') {
        //     await Budget.findByIdAndUpdate(
        //         payload.linkedBudgetId,
        //         {
        //             $inc: { spentAmount: payload.amount } // $inc atomically adds the amount
        //         },
        //         { new: true }
        //     );
        //     console.log(`💰 Added ${payload.amount} to Goal ${payload.linkedBudgetId}`);
        // }
        // Push job
        // Wrap in try/catch or handle specifically if job failure shouldn't block response
        // try {
        //     console.log("add job")
        //     await addBudgetJob(txn);
        // } catch (jobError) {
        //     console.error('Budget Job Error:', jobError);
        // }

        res.status(201).json({ txn });
    } catch (err) {
        console.error('Create Transaction Error:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateTransaction = async (req, res) => {
    try {
        const { id } = req.query;
        const { amount, category, type, linkedGoalId, date, notes, recurring } = req.body;

        // 1. Fetch the EXISTING transaction (Before update)
        const oldTxn = await Transaction.findById(id);
        if (!oldTxn) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // --- STEP 1: REVERT OLD IMPACT ---
        // If the old transaction was contributing to a goal, REMOVE that money first.
        if (oldTxn.category === 'Savings' && oldTxn.linkedGoalId) {
            await Goal.findByIdAndUpdate(oldTxn.linkedGoalId, {
                $inc: { savedAmount: -oldTxn.amount } // Subtract OLD amount
            });
        }
        // if (oldTxn.type === 'expense' && oldTxn.linkedBudgetId) {
        //     await Goal.findByIdAndUpdate(oldTxn.linkedBudgetId, {
        //         $inc: { spentAmount: -oldTxn.amount } // Subtract OLD amount
        //     });
        // }

        // --- STEP 2: UPDATE TRANSACTION ---
        // Now update the transaction record itself
        const updatedTxn = await Transaction.findByIdAndUpdate(
            id,
            { amount, category, type, linkedGoalId, date, notes, recurringConfig: recurring },
            { new: true } // Return the updated document
        );

        // --- STEP 3: APPLY NEW IMPACT ---
        // If the NEW transaction is Savings and has a goal, ADD the new money.
        // We check 'updatedTxn' here to ensure we use the fresh data.
        if (updatedTxn.category === 'Savings' && updatedTxn.linkedGoalId) {
            await Goal.findByIdAndUpdate(updatedTxn.linkedGoalId, {
                $inc: { savedAmount: updatedTxn.amount } // Add NEW amount
            });
        }
        // if (updatedTxn.type === 'expense' && updatedTxn.linkedBudgetId) {
        //     await Goal.findByIdAndUpdate(updatedTxn.linkedBudgetId, {
        //         $inc: { spentAmount: updatedTxn.amount } // Add NEW amount
        //     });
        // }

        // Push job
        // Wrap in try/catch or handle specifically if job failure shouldn't block response
        // try {
        //     console.log("add job")
        //     // await addBudgetJob(txn);
        // } catch (jobError) {
        //     console.error('Budget Job Error:', jobError);
        // }

        res.status(200).json(updatedTxn);

    } catch (error) {
        console.error("Update Transaction Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};


exports.list = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        // 2. Run List & Stats in Parallel
        const [txns, statsResult] = await Promise.all([
            // A. Get List (Mongoose handles casting here automatically)
            Transaction.find({ userId })
                .sort({ date: -1 })
                .limit(200),

            // B. Get Stats (Aggregated)
            Transaction.aggregate([
                {
                    $match: {
                        // 3. FIX: Manually cast string to ObjectId for Aggregation
                        userId: new mongoose.Types.ObjectId(userId)
                    }
                },
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
        // Handle case where user has 0 transactions (statsResult is empty array)
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





exports.deleteTransaction = async (req, res) => {
    try {
        const userId = req.userId;
        const txnId = req.query.id;

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