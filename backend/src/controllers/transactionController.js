const Transaction = require('../models/transactionModel');
const addBudgetJob = require('../workers/budgetWorkerAddJob');


exports.create = async (req, res) => {
    try {
        const payload = req.body;
        // expect userId in body for now; later use auth middleware
        const txn = await Transaction.create(payload);
        // push job
        await addBudgetJob(txn);
        res.status(201).json({ txn });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


exports.list = async (req, res) => {
    const { userId, from, to } = req.query;
    const query = { userId };
    if (from || to) query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
    const txns = await Transaction.find(query).sort({ date: -1 }).limit(200);
    res.json({ txns });
};