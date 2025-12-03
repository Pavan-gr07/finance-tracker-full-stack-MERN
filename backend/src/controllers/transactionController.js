const Transaction = require('../models/transactionModel');
const addBudgetJob = require('../workers/budgetWorkerAddJob');

exports.create = async (req, res) => {
    try {
        const payload = req.body;

        // Basic validation
        if (!payload.userId || !payload.amount) {
            return res.status(400).json({ error: 'userId and amount are required' });
        }

        const txn = await Transaction.create(payload);

        // Push job
        // Wrap in try/catch or handle specifically if job failure shouldn't block response
        try {
            await addBudgetJob(txn);
        } catch (jobError) {
            console.error('Budget Job Error:', jobError);
            // Optional: decide if you want to return an error or just log it
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
        const { userId, from, to } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const query = { userId };

        if (from || to) {
            query.date = {};
            if (from) {
                const fromDate = new Date(from);
                if (isNaN(fromDate)) return res.status(400).json({ error: 'Invalid from date' });
                query.date.$gte = fromDate;
            }
            if (to) {
                const toDate = new Date(to);
                if (isNaN(toDate)) return res.status(400).json({ error: 'Invalid to date' });
                query.date.$lte = toDate;
            }
        }

        const txns = await Transaction.find(query).sort({ date: -1 }).limit(200);
        res.json({ txns });
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



export const updateTransaction = async (req, res) => {
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

export const deleteTransaction = async (req, res) => {
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