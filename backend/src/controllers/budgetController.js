const Budget = require('../models/budgetModel');


exports.create = async (req, res) => {
    try {
        const b = await Budget.create(req.body);
        res.status(201).json({ budget: b });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


exports.list = async (req, res) => {
    const { userId } = req.query;
    const budgets = await Budget.find({ userId });
    res.json({ budgets });
};